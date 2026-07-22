import React from 'react';
import {
    act,
    render,
    renderHook,
    screen,
    waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentsAvailabilityContext } from '@/context/comments-context/comments-context';
import { CommentsProvider } from '@/context/comments-context/comments-provider';
import { useCommentsAvailability } from '@/hooks/use-comments-availability';
import { useDiagramComments } from '@/hooks/use-diagram-comments';
import { useCommentMutations } from '@/hooks/use-comment-mutations';
import {
    CommentsProviderTestWrapper,
    createCommentFixture,
    createCommentsProviderTestEnv,
    resetCommentsProviderTestEnv,
} from '@/context/comments-context/__tests__/comments-provider-test-utils';

const {
    listDiagramComments,
    createDiagramComment,
    updateDiagramComment,
    deleteDiagramComment,
} = vi.hoisted(() => ({
    listDiagramComments: vi.fn(),
    createDiagramComment: vi.fn(),
    updateDiagramComment: vi.fn(),
    deleteDiagramComment: vi.fn(),
}));

const env = createCommentsProviderTestEnv();

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => env.authValue,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ currentDiagram: env.currentDiagram }),
}));

vi.mock('@/hooks/use-realtime', () => ({
    useRealtime: () => env.realtimeValue,
}));

vi.mock('@/lib/api/diagram-comments', () => ({
    listDiagramComments,
    createDiagramComment,
    updateDiagramComment,
    deleteDiagramComment,
}));

describe('useCommentsAvailability', () => {
    beforeEach(() => {
        resetCommentsProviderTestEnv(env);
        listDiagramComments.mockReset();
        createDiagramComment.mockReset();
        updateDiagramComment.mockReset();
        deleteDiagramComment.mockReset();
        listDiagramComments.mockResolvedValue([]);
    });

    it('is false outside CommentsProvider', () => {
        const { result } = renderHook(() => useCommentsAvailability());
        expect(result.current).toBe(false);
    });

    it('is true when the provider is active', async () => {
        const { result } = renderHook(() => useCommentsAvailability(), {
            wrapper: CommentsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    it('is false when the provider is inactive', async () => {
        env.authValue = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
        };
        env.currentDiagram = null;

        const { result } = renderHook(() => useCommentsAvailability(), {
            wrapper: CommentsProviderTestWrapper,
        });

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('keeps availability context value identity while isActive stays true across comment changes', async () => {
        listDiagramComments.mockResolvedValue([
            createCommentFixture({ id: 1 }),
        ]);

        const seen: boolean[] = [];
        const Probe: React.FC = () => {
            seen.push(React.useContext(CommentsAvailabilityContext));
            return null;
        };

        const { result } = renderHook(
            () => ({
                comments: useDiagramComments(),
                mutations: useCommentMutations(),
            }),
            {
                wrapper: ({ children }) => (
                    <CommentsProviderTestWrapper>
                        <Probe />
                        {children}
                    </CommentsProviderTestWrapper>
                ),
            }
        );

        await waitFor(() => {
            expect(result.current.comments.status).toBe('ready');
        });

        expect(seen.length).toBeGreaterThan(0);
        expect(seen.every((value) => value === true)).toBe(true);

        const created = createCommentFixture({
            id: 2,
            body: 'new',
            targetType: 'table',
            targetId: 't1',
        });
        createDiagramComment.mockResolvedValue(created);

        const seenBeforeCreate = seen.length;

        await act(async () => {
            await result.current.mutations.createComment({
                targetType: 'table',
                targetId: 't1',
                body: 'new',
            });
        });

        await waitFor(() => {
            expect(result.current.comments.comments).toHaveLength(2);
        });

        // Availability-only Probe must not re-render while isActive stays true.
        expect(seen.length).toBe(seenBeforeCreate);

        deleteDiagramComment.mockResolvedValue(undefined);
        await act(async () => {
            await result.current.mutations.deleteComment(2);
        });

        await waitFor(() => {
            expect(result.current.comments.comments).toHaveLength(1);
        });

        expect(seen.length).toBe(seenBeforeCreate);
    });

    it('does not rerender an availability-only consumer when comments change', async () => {
        listDiagramComments.mockResolvedValue([
            createCommentFixture({ id: 1 }),
        ]);

        let availabilityRenders = 0;
        const AvailabilityProbe = () => {
            const isActive = useCommentsAvailability();
            availabilityRenders += 1;
            return <div data-testid="availability">{String(isActive)}</div>;
        };

        let fullRenders = 0;
        const FullAndMutationsHarness = () => {
            const { comments } = useDiagramComments();
            const mutations = useCommentMutations();
            fullRenders += 1;

            React.useEffect(() => {
                (
                    window as unknown as {
                        __createComment?: typeof mutations.createComment;
                    }
                ).__createComment = mutations.createComment;
            });

            return <div data-testid="count">{comments.length}</div>;
        };

        render(
            <CommentsProvider>
                <AvailabilityProbe />
                <FullAndMutationsHarness />
            </CommentsProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('count')).toHaveTextContent('1');
        });

        const rendersAfterReady = availabilityRenders;
        expect(screen.getByTestId('availability')).toHaveTextContent('true');
        expect(rendersAfterReady).toBeGreaterThan(0);

        const created = createCommentFixture({
            id: 3,
            body: 'another',
            targetType: 'diagram',
            targetId: null,
        });
        createDiagramComment.mockResolvedValue(created);

        await act(async () => {
            const create = (
                window as unknown as {
                    __createComment: (input: {
                        targetType: 'diagram';
                        targetId: null;
                        body: string;
                    }) => Promise<unknown>;
                }
            ).__createComment;
            await create({
                targetType: 'diagram',
                targetId: null,
                body: 'another',
            });
        });

        await waitFor(() => {
            expect(screen.getByTestId('count')).toHaveTextContent('2');
        });

        expect(availabilityRenders).toBe(rendersAfterReady);
        expect(fullRenders).toBeGreaterThan(1);
    });

    it('rerenders availability consumers when isActive changes', async () => {
        let availabilityRenders = 0;
        const AvailabilityProbe = () => {
            const isActive = useCommentsAvailability();
            availabilityRenders += 1;
            return <div data-testid="availability">{String(isActive)}</div>;
        };

        const { rerender } = render(
            <CommentsProvider>
                <AvailabilityProbe />
            </CommentsProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('availability')).toHaveTextContent(
                'true'
            );
        });

        const rendersWhileActive = availabilityRenders;

        env.authValue = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
        };
        env.currentDiagram = null;

        rerender(
            <CommentsProvider>
                <AvailabilityProbe />
            </CommentsProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('availability')).toHaveTextContent(
                'false'
            );
        });

        expect(availabilityRenders).toBeGreaterThan(rendersWhileActive);
    });

    it('keeps full CommentsContext consumers updating on comment changes', async () => {
        listDiagramComments.mockResolvedValue([
            createCommentFixture({ id: 1 }),
        ]);

        const { result } = renderHook(
            () => ({
                comments: useDiagramComments(),
                mutations: useCommentMutations(),
                availability: useCommentsAvailability(),
            }),
            { wrapper: CommentsProviderTestWrapper }
        );

        await waitFor(() => {
            expect(result.current.comments.status).toBe('ready');
        });

        expect(result.current.availability).toBe(true);
        expect(result.current.comments.comments).toHaveLength(1);

        const created = createCommentFixture({ id: 9, body: 'x' });
        createDiagramComment.mockResolvedValue(created);

        await act(async () => {
            await result.current.mutations.createComment({
                targetType: 'diagram',
                targetId: null,
                body: 'x',
            });
        });

        await waitFor(() => {
            expect(result.current.comments.comments.map((c) => c.id)).toEqual([
                1, 9,
            ]);
        });
        expect(result.current.availability).toBe(true);
    });
});
