import React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    DiagramComment,
    DiagramCommentTarget,
} from '@/lib/comments/comment-types';
import type { UseDiagramCommentsResult } from '@/hooks/use-diagram-comments';
import type { DiscussionView } from '@/context/layout-context/layout-context';
import { DIAGRAM_DISCUSSION_TARGET } from '@/lib/comments/resolve-discussion-target';
import { en } from '@/i18n/locales/en';
import {
    isEnglishTimeAgoLocaleId,
    OFFICIAL_APPLICATION_LOCALES,
    resolveTimeAgoLocale,
} from '../comment-timeago-locale';
import { format, register as registerLocale } from 'timeago.js';

const { commentsState, i18nState, layoutState, accessState, chartDbState } =
    vi.hoisted(() => ({
        commentsState: {
            current: {
                comments: [],
                status: 'idle',
                error: null,
                isActive: true,
                diagramId: '42',
                reload: vi.fn(async () => undefined),
            } as UseDiagramCommentsResult,
        },
        i18nState: {
            language: 'en',
        },
        layoutState: {
            discussionView: 'all' as DiscussionView,
            commentsTarget: {
                targetType: 'diagram',
                targetId: null,
            } as DiagramCommentTarget,
            openAllDiscussions: vi.fn(),
            openDiagramDiscussion: vi.fn(),
        },
        accessState: {
            can_edit: true as boolean | undefined,
            available: true,
        },
        chartDbState: {
            tables: [
                {
                    id: 'table-1',
                    name: 'Clients',
                    x: 0,
                    y: 0,
                    fields: [
                        {
                            id: 'field-1',
                            name: 'email',
                            type: { id: 'text', name: 'text' },
                            primaryKey: false,
                            unique: false,
                            nullable: true,
                            createdAt: 0,
                        },
                    ],
                    indexes: [],
                    color: '#fff',
                    isView: false,
                    createdAt: 0,
                },
            ],
            relationships: [
                {
                    id: 'rel-1',
                    name: 'orders_fk',
                    sourceTableId: 'table-1',
                    targetTableId: 'table-1',
                    sourceFieldId: 'field-1',
                    targetFieldId: 'field-1',
                    sourceCardinality: 'one' as const,
                    targetCardinality: 'many' as const,
                    createdAt: 0,
                },
            ],
        },
    }));

vi.mock('@/hooks/use-diagram-comments', () => ({
    useDiagramComments: () => commentsState.current,
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => layoutState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => chartDbState,
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: accessState.available
            ? {
                  role: accessState.can_edit ? 'editor' : 'viewer',
                  can_edit: accessState.can_edit === true,
                  can_manage_members: false,
              }
            : null,
    }),
}));

vi.mock('../comments-composer', () => ({
    CommentsComposer: ({
        diagramId,
        target,
    }: {
        diagramId: string;
        target: { targetType: string; targetId: string | null };
    }) => (
        <div
            data-testid="comments-composer"
            data-diagram-id={diagramId}
            data-target-type={target.targetType}
            data-target-id={target.targetId ?? ''}
        >
            Composer
        </div>
    ),
}));

vi.mock('@/hooks/use-theme', () => ({
    useTheme: () => ({ effectiveTheme: 'light' }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, string>) => {
            const parts = key.split('.');
            let current: unknown = en.translation;
            for (const part of parts) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(part in current)
                ) {
                    return key;
                }
                current = (current as Record<string, unknown>)[part];
            }
            if (typeof current !== 'string') {
                return key;
            }
            if (!options) {
                return current;
            }
            return current.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
                Object.prototype.hasOwnProperty.call(options, name)
                    ? options[name]
                    : `{{${name}}}`
            );
        },
        i18n: i18nState,
    }),
}));

vi.mock('timeago-react', () => ({
    default: ({
        datetime,
        locale,
    }: {
        datetime: Date | string;
        locale?: string;
    }) => {
        const value =
            datetime instanceof Date
                ? datetime.toISOString()
                : String(datetime);
        return (
            <span data-testid="relative-time" data-locale={locale ?? ''}>
                {value}
            </span>
        );
    },
}));

import { CommentsSection } from '../comments-section';

const createComment = (
    overrides: Partial<DiagramComment> & Pick<DiagramComment, 'id'>
): DiagramComment => ({
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: `body-${overrides.id}`,
    user: { id: 1, name: 'Alice Wonder' },
    createdAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    updatedAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    ...overrides,
});

const setState = (partial: Partial<UseDiagramCommentsResult>) => {
    commentsState.current = {
        comments: [],
        status: 'idle',
        error: null,
        isActive: true,
        diagramId: '42',
        reload: vi.fn(async () => undefined),
        ...partial,
    };
};

const setLayout = (partial: Partial<typeof layoutState>) => {
    Object.assign(layoutState, partial);
};

const deferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

describe('CommentsSection', () => {
    beforeEach(() => {
        i18nState.language = 'en';
        accessState.can_edit = true;
        accessState.available = true;
        setLayout({
            discussionView: 'all',
            commentsTarget: DIAGRAM_DISCUSSION_TARGET,
            openAllDiscussions: vi.fn(),
            openDiagramDiscussion: vi.fn(),
        });
        setState({ isActive: true, status: 'ready', comments: [] });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows the inactive state without attempting a request', () => {
        const reload = vi.fn(async () => undefined);
        setState({
            isActive: false,
            status: 'idle',
            comments: [],
            reload,
        });

        render(<CommentsSection />);

        expect(screen.getByText('Discussions unavailable')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Discussions are only available on authenticated cloud diagrams.'
            )
        ).toBeInTheDocument();
        expect(reload).not.toHaveBeenCalled();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('shows initial loading when status is loading and there are no comments', () => {
        setState({ status: 'loading', comments: [] });

        render(<CommentsSection />);

        expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByText('Loading discussions…')).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('shows the empty ready state', () => {
        setState({ status: 'ready', comments: [] });

        render(<CommentsSection />);

        expect(screen.getByText('No discussions yet')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Conversations about this diagram will appear here.'
            )
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('comments-composer')
        ).not.toBeInTheDocument();
    });

    it('shows a load error with retry and never renders the raw error', async () => {
        const user = userEvent.setup();
        const reload = vi.fn(async () => undefined);
        setState({
            status: 'error',
            error: new Error('secret backend failure XYZ'),
            comments: [],
            reload,
        });

        render(<CommentsSection />);

        expect(
            screen.getByText('Could not load discussions')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('secret backend failure XYZ')
        ).not.toBeInTheDocument();

        const retry = screen.getByRole('button', { name: 'Retry' });
        await user.click(retry);

        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('disables Retry while reload is pending', async () => {
        const pending = deferred<void>();
        const reload = vi.fn(() => pending.promise);
        setState({
            status: 'error',
            error: new Error('fail'),
            comments: [],
            reload,
        });

        render(<CommentsSection />);

        const retry = screen.getByRole('button', { name: 'Retry' });
        await act(async () => {
            retry.click();
        });

        expect(retry).toBeDisabled();
        expect(reload).toHaveBeenCalledTimes(1);

        await act(async () => {
            pending.resolve();
        });

        await waitFor(() => {
            expect(retry).not.toBeDisabled();
        });
    });

    it('invokes reload only once for two same-tick Retry clicks', async () => {
        const pending = deferred<void>();
        const reload = vi.fn(() => pending.promise);
        setState({
            status: 'error',
            error: new Error('fail'),
            comments: [],
            reload,
        });

        render(<CommentsSection />);

        const retry = screen.getByRole('button', { name: 'Retry' });
        await act(async () => {
            retry.click();
            retry.click();
        });

        expect(reload).toHaveBeenCalledTimes(1);

        await act(async () => {
            pending.resolve();
        });
    });

    it('handles rejected reload without unhandled rejection and re-enables Retry', async () => {
        const pending = deferred<void>();
        const reload = vi.fn(() => pending.promise);
        const unhandled: unknown[] = [];
        const onUnhandled = (reason: unknown) => {
            unhandled.push(reason);
        };
        process.on('unhandledRejection', onUnhandled);

        setState({
            status: 'error',
            error: new Error('visible provider error'),
            comments: [],
            reload,
        });

        render(<CommentsSection />);

        const retry = screen.getByRole('button', { name: 'Retry' });
        await act(async () => {
            retry.click();
        });

        await act(async () => {
            pending.reject(new Error('network down'));
        });

        await waitFor(() => {
            expect(retry).not.toBeDisabled();
        });

        expect(
            screen.getByText('Could not load discussions')
        ).toBeInTheDocument();
        expect(screen.queryByText('network down')).not.toBeInTheDocument();
        expect(
            screen.queryByText('visible provider error')
        ).not.toBeInTheDocument();
        expect(unhandled).toHaveLength(0);

        process.off('unhandledRejection', onUnhandled);
    });

    it('does not warn about state updates when unmounted during pending reload', async () => {
        const pending = deferred<void>();
        const reload = vi.fn(() => pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        setState({
            status: 'error',
            error: new Error('fail'),
            comments: [],
            reload,
        });

        const { unmount } = render(<CommentsSection />);
        const retry = screen.getByRole('button', { name: 'Retry' });

        await act(async () => {
            retry.click();
        });

        unmount();

        await act(async () => {
            pending.resolve();
        });

        const messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        expect(messages).not.toMatch(
            /Can't perform a React state update on a component/i
        );

        consoleError.mockRestore();
    });

    it('keeps existing comments visible while reloading', () => {
        setState({
            status: 'loading',
            comments: [createComment({ id: 1, body: 'Still here' })],
        });

        render(<CommentsSection />);

        expect(screen.getByText('Still here')).toBeInTheDocument();
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(
            screen.queryByText('Loading discussions…')
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('status', { name: 'Loading discussions…' })
        ).toBeInTheDocument();
    });

    it('keeps existing comments visible on reload error and offers retry', async () => {
        const user = userEvent.setup();
        const reload = vi.fn(async () => undefined);
        setState({
            status: 'error',
            error: new Error('raw reload boom'),
            comments: [createComment({ id: 1, body: 'Persisted message' })],
            reload,
        });

        render(<CommentsSection />);

        expect(screen.getByText('Persisted message')).toBeInTheDocument();
        expect(screen.queryByText('raw reload boom')).not.toBeInTheDocument();

        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);

        await user.click(screen.getByRole('button', { name: 'Retry' }));
        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('keeps existing comments visible while a reload retry is pending', async () => {
        const pending = deferred<void>();
        const reload = vi.fn(() => pending.promise);
        setState({
            status: 'error',
            error: new Error('reload failed'),
            comments: [createComment({ id: 1, body: 'Keep me' })],
            reload,
        });

        render(<CommentsSection />);

        const retry = screen.getByRole('button', { name: 'Retry' });
        await act(async () => {
            retry.click();
        });

        expect(screen.getByText('Keep me')).toBeInTheDocument();
        expect(retry).toBeDisabled();
        expect(screen.queryByText('reload failed')).not.toBeInTheDocument();

        await act(async () => {
            pending.resolve();
        });
    });

    it('renders comments in received order as a semantic list', () => {
        setState({
            status: 'ready',
            comments: [
                createComment({ id: 1, body: 'First' }),
                createComment({ id: 2, body: 'Second' }),
                createComment({ id: 3, body: 'Third' }),
            ],
        });

        render(<CommentsSection />);

        const list = screen.getByRole('list');
        expect(list).toHaveAttribute(
            'aria-labelledby',
            'comments-section-heading'
        );
        const items = within(list).getAllByRole('listitem');
        expect(items).toHaveLength(3);
        expect(items.map((item) => item.textContent)).toEqual(
            expect.arrayContaining([
                expect.stringContaining('First'),
                expect.stringContaining('Second'),
                expect.stringContaining('Third'),
            ])
        );
        expect(items[0].textContent).toContain('First');
        expect(items[1].textContent).toContain('Second');
        expect(items[2].textContent).toContain('Third');
    });

    it('renders known author name and initials', () => {
        setState({
            status: 'ready',
            comments: [
                createComment({
                    id: 1,
                    user: { id: 7, name: 'Alice Wonder' },
                }),
            ],
        });

        render(<CommentsSection />);

        expect(screen.getByText('Alice Wonder')).toBeInTheDocument();
        expect(screen.getByText('AW')).toBeInTheDocument();
    });

    it('renders deleted author fallback', () => {
        setState({
            status: 'ready',
            comments: [createComment({ id: 1, user: null })],
        });

        render(<CommentsSection />);

        expect(screen.getByText('Deleted user')).toBeInTheDocument();
        expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('renders relative and accessible exact timestamps with locale', () => {
        const createdAt = '2026-01-05T10:00:00.000Z';
        i18nState.language = 'pt_BR';
        setState({
            status: 'ready',
            comments: [createComment({ id: 1, createdAt })],
        });

        render(<CommentsSection />);

        expect(screen.getByTestId('relative-time')).toHaveAttribute(
            'data-locale',
            'pt_BR'
        );

        const time = screen.getByText(
            (_, element) => element?.tagName === 'TIME'
        );
        expect(time).toHaveAttribute('dateTime', createdAt);
        expect(time).toHaveAttribute('title');
        expect(time.getAttribute('title')).toBeTruthy();
    });

    it('updates the TimeAgo locale when the i18n language changes', () => {
        i18nState.language = 'fr';
        setState({
            status: 'ready',
            comments: [createComment({ id: 1 })],
        });

        const { rerender } = render(<CommentsSection />);
        expect(screen.getByTestId('relative-time')).toHaveAttribute(
            'data-locale',
            'fr'
        );

        i18nState.language = 'ko_KR';
        rerender(<CommentsSection />);
        expect(screen.getByTestId('relative-time')).toHaveAttribute(
            'data-locale',
            'ko'
        );
    });

    it('resolves all 22 official locales without English fallback for non-English codes', () => {
        for (const code of OFFICIAL_APPLICATION_LOCALES) {
            const resolved = resolveTimeAgoLocale(code);
            expect(resolved.lang).toBeTruthy();
            expect(resolved.locale).toEqual(expect.any(Function));

            if (code === 'en') {
                expect(resolved.lang).toBe('en_US');
            } else {
                expect(isEnglishTimeAgoLocaleId(resolved.lang)).toBe(false);
            }
        }
    });

    it('maps normalized locale codes to the correct TimeAgo ids', () => {
        expect(resolveTimeAgoLocale('ko_KR').lang).toBe('ko');
        expect(resolveTimeAgoLocale('pt_BR').lang).toBe('pt_BR');
        expect(resolveTimeAgoLocale('id_ID').lang).toBe('id_ID');
        expect(resolveTimeAgoLocale('zh_CN').lang).toBe('zh_CN');
        expect(resolveTimeAgoLocale('zh_TW').lang).toBe('zh_TW');
        expect(resolveTimeAgoLocale('hi').lang).toBe('hi_IN');
        expect(resolveTimeAgoLocale('bn').lang).toBe('bn_IN');
    });

    it.each([
        ['hr', 'hr', /prije/],
        ['ne', 'ne', /मिनेट|अघि/],
        ['mr', 'mr', /मिनिट|पूर्वी/],
        ['te', 'te', /నిమిష|క్రితం/],
        ['gu', 'gu', /મિનિટ|પહેલાં/],
    ] as const)(
        'registers and formats %s with a localized relative-time locale',
        (appCode, expectedLang, localizedPattern) => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const { locale, lang } = resolveTimeAgoLocale(appCode);
            expect(lang).toBe(expectedLang);
            expect(isEnglishTimeAgoLocaleId(lang)).toBe(false);

            registerLocale(lang, locale);
            const formatted = format(fiveMinutesAgo, lang);
            expect(formatted).toMatch(localizedPattern);
            expect(formatted.toLowerCase()).not.toMatch(/\bago\b/);
            expect(formatted.toLowerCase()).not.toMatch(/\bminute/);
        }
    );

    it('falls back to en_US only for genuinely unknown language codes', () => {
        expect(resolveTimeAgoLocale('xyz-unknown')).toMatchObject({
            lang: 'en_US',
        });
        expect(resolveTimeAgoLocale('hr').lang).toBe('hr');
        expect(resolveTimeAgoLocale('ne').lang).toBe('ne');
        expect(resolveTimeAgoLocale('mr').lang).toBe('mr');
        expect(resolveTimeAgoLocale('te').lang).toBe('te');
        expect(resolveTimeAgoLocale('gu').lang).toBe('gu');
    });

    it('does not render a time element for invalid timestamps', () => {
        setState({
            status: 'ready',
            comments: [
                createComment({ id: 1, createdAt: 'not-a-real-timestamp' }),
            ],
        });

        render(<CommentsSection />);

        expect(screen.queryByTestId('relative-time')).not.toBeInTheDocument();
        expect(
            screen.queryByText((_, element) => element?.tagName === 'TIME')
        ).not.toBeInTheDocument();
    });

    it.each([
        ['diagram', null, 'Diagram discussion'],
        ['table', 'tbl-1', 'Table discussion'],
        ['field', 'fld-1', 'Field discussion'],
        ['relationship', 'rel-1', 'Relationship discussion'],
    ] as const)(
        'renders %s target context without raw target ids',
        (targetType, targetId, label) => {
            setState({
                status: 'ready',
                comments: [
                    createComment({
                        id: 1,
                        targetType,
                        targetId,
                        body: 'Hello',
                    }),
                ],
            });

            render(<CommentsSection />);

            expect(screen.getByText(label)).toBeInTheDocument();
            if (targetId) {
                expect(screen.queryByText(targetId)).not.toBeInTheDocument();
            }
        }
    );

    it('preserves multiline bodies and long-word wrapping classes', () => {
        const longWord =
            'supercalifragilisticexpialidocioussupercalifragilisticexpialidocious';
        setState({
            status: 'ready',
            comments: [
                createComment({
                    id: 1,
                    body: `line one\nline two\n${longWord}`,
                }),
            ],
        });

        render(<CommentsSection />);

        const body = screen.getByText((_, element) => {
            return (
                element?.tagName === 'P' &&
                (element.textContent?.includes('line one') ?? false) &&
                (element.textContent?.includes('line two') ?? false)
            );
        });

        expect(body).toHaveClass('whitespace-pre-wrap');
        expect(body).toHaveClass('break-words');
        expect(body.className).toMatch(
            /overflow-wrap:anywhere|\[overflow-wrap:anywhere\]/
        );
        expect(body.textContent).toContain('line one\nline two');
    });

    it('renders HTML/script-like content as text only', () => {
        const malicious = '<script>alert(1)</script>';
        setState({
            status: 'ready',
            comments: [createComment({ id: 1, body: malicious })],
        });

        const { container } = render(<CommentsSection />);

        expect(screen.getByText(malicious)).toBeInTheDocument();
        expect(container.querySelector('script')).toBeNull();
        expect(container.innerHTML).toContain('&lt;script&gt;');
    });

    it('has an accessible heading and bounded scroll area without unauthorized actions', () => {
        setState({
            status: 'ready',
            comments: [createComment({ id: 1, body: 'Hello' })],
        });

        render(<CommentsSection />);

        const heading = screen.getByRole('heading', { name: 'Discussions' });
        expect(heading).toHaveAttribute('id', 'comments-section-heading');

        const section = heading.closest('section');
        expect(section).toHaveAttribute(
            'aria-labelledby',
            'comments-section-heading'
        );

        expect(screen.getByTestId('comments-scroll-area')).toBeInTheDocument();
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(
            screen.queryByTestId('comments-composer')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('ensures interactive controls have accessible names', async () => {
        const user = userEvent.setup();
        const reload = vi.fn(async () => undefined);
        setState({
            status: 'error',
            comments: [],
            error: new Error('nope'),
            reload,
        });

        render(<CommentsSection />);

        const buttons = screen.getAllByRole('button');
        for (const button of buttons) {
            expect(button).toHaveAccessibleName();
        }

        await user.click(screen.getByRole('button', { name: 'Retry' }));
        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('hides the composer when inactive', () => {
        setState({
            isActive: false,
            status: 'idle',
            comments: [],
            diagramId: null,
        });

        render(<CommentsSection />);

        expect(
            screen.queryByTestId('comments-composer')
        ).not.toBeInTheDocument();
    });

    it('hides the composer during initial loading', () => {
        setState({ status: 'loading', comments: [], diagramId: '42' });

        render(<CommentsSection />);

        expect(
            screen.queryByTestId('comments-composer')
        ).not.toBeInTheDocument();
    });

    it('hides the composer during a fatal load error', () => {
        setState({
            status: 'error',
            comments: [],
            error: new Error('fail'),
            diagramId: '42',
        });

        render(<CommentsSection />);

        expect(
            screen.queryByTestId('comments-composer')
        ).not.toBeInTheDocument();
    });

    it('hides the composer in the all view even when ready and empty', () => {
        setState({ status: 'ready', comments: [], diagramId: '42' });

        render(<CommentsSection />);

        expect(
            screen.queryByTestId('comments-composer')
        ).not.toBeInTheDocument();
    });

    it('shows the diagram composer in the diagram view for editable roles', () => {
        setLayout({
            discussionView: 'diagram',
            commentsTarget: DIAGRAM_DISCUSSION_TARGET,
        });
        setState({ status: 'ready', comments: [], diagramId: '42' });

        render(<CommentsSection />);

        const composer = screen.getByTestId('comments-composer');
        expect(composer).toHaveAttribute('data-diagram-id', '42');
        expect(composer).toHaveAttribute('data-target-type', 'diagram');
        expect(composer).toHaveAttribute('data-target-id', '');
    });

    it('shows the composer when comments already exist in diagram view', () => {
        setLayout({
            discussionView: 'diagram',
            commentsTarget: DIAGRAM_DISCUSSION_TARGET,
        });
        setState({
            status: 'ready',
            comments: [createComment({ id: 1 })],
            diagramId: '42',
        });

        render(<CommentsSection />);

        expect(screen.getByTestId('comments-composer')).toBeInTheDocument();
    });

    it('keeps the composer visible during reload loading in diagram view', () => {
        setLayout({
            discussionView: 'diagram',
            commentsTarget: DIAGRAM_DISCUSSION_TARGET,
        });
        setState({
            status: 'loading',
            comments: [createComment({ id: 1, body: 'Still here' })],
            diagramId: '42',
        });

        render(<CommentsSection />);

        expect(screen.getByText('Still here')).toBeInTheDocument();
        expect(screen.getByTestId('comments-composer')).toBeInTheDocument();
    });

    it('keeps the composer visible during reload error in diagram view', () => {
        setLayout({
            discussionView: 'diagram',
            commentsTarget: DIAGRAM_DISCUSSION_TARGET,
        });
        setState({
            status: 'error',
            error: new Error('reload failed'),
            comments: [createComment({ id: 1, body: 'Keep me' })],
            diagramId: '42',
        });

        render(<CommentsSection />);

        expect(screen.getByText('Keep me')).toBeInTheDocument();
        expect(screen.getByTestId('comments-composer')).toBeInTheDocument();
    });

    it('does not show counters or action triggers without auth', () => {
        setState({
            status: 'ready',
            comments: [createComment({ id: 1 }), createComment({ id: 2 })],
        });

        const { container } = render(<CommentsSection />);

        expect(
            screen.queryByTestId('comments-composer')
        ).not.toBeInTheDocument();
        expect(within(container).queryByText(/^\d+$/)).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('renders all comments in the all view without a composer', () => {
        setState({
            status: 'ready',
            comments: [
                createComment({ id: 1, body: 'Diagram note' }),
                createComment({
                    id: 2,
                    body: 'Table note',
                    targetType: 'table',
                    targetId: 'table-1',
                }),
            ],
        });

        render(<CommentsSection />);

        expect(screen.getByText('Diagram note')).toBeInTheDocument();
        expect(screen.getByText('Table note')).toBeInTheDocument();
        expect(
            screen.queryByTestId('comments-composer')
        ).not.toBeInTheDocument();
    });

    it('filters to diagram comments in the diagram view', () => {
        setLayout({
            discussionView: 'diagram',
            commentsTarget: DIAGRAM_DISCUSSION_TARGET,
        });
        setState({
            status: 'ready',
            comments: [
                createComment({ id: 1, body: 'Diagram note' }),
                createComment({
                    id: 2,
                    body: 'Table note',
                    targetType: 'table',
                    targetId: 'table-1',
                }),
            ],
        });

        render(<CommentsSection />);

        expect(screen.getByText('Diagram note')).toBeInTheDocument();
        expect(screen.queryByText('Table note')).not.toBeInTheDocument();
    });

    it('filters to the exact target and matches composer target', () => {
        const target = {
            targetType: 'table' as const,
            targetId: 'table-1',
        };
        setLayout({
            discussionView: 'target',
            commentsTarget: target,
        });
        setState({
            status: 'ready',
            comments: [
                createComment({ id: 1, body: 'Diagram note' }),
                createComment({
                    id: 2,
                    body: 'Table note',
                    targetType: 'table',
                    targetId: 'table-1',
                }),
                createComment({
                    id: 3,
                    body: 'Other table',
                    targetType: 'table',
                    targetId: 'table-other',
                }),
            ],
        });

        render(<CommentsSection />);

        expect(screen.getByText('Table note')).toBeInTheDocument();
        expect(screen.queryByText('Diagram note')).not.toBeInTheDocument();
        expect(screen.queryByText('Other table')).not.toBeInTheDocument();

        const composer = screen.getByTestId('comments-composer');
        expect(composer).toHaveAttribute('data-target-type', 'table');
        expect(composer).toHaveAttribute('data-target-id', 'table-1');
        expect(screen.getByTestId('comments-current-target')).toHaveTextContent(
            'Table Clients'
        );
        expect(screen.queryByText('table-1')).not.toBeInTheDocument();
    });

    it('hides the composer for viewers while keeping scoped comments', () => {
        accessState.can_edit = false;
        setLayout({
            discussionView: 'target',
            commentsTarget: {
                targetType: 'table',
                targetId: 'table-1',
            },
        });
        setState({
            status: 'ready',
            comments: [
                createComment({
                    id: 1,
                    body: 'Visible to viewer',
                    targetType: 'table',
                    targetId: 'table-1',
                }),
            ],
        });

        render(<CommentsSection />);

        expect(screen.getByText('Visible to viewer')).toBeInTheDocument();
        expect(
            screen.queryByTestId('comments-composer')
        ).not.toBeInTheDocument();
    });

    it('shows missing target fallback without raw ids', () => {
        setLayout({
            discussionView: 'target',
            commentsTarget: {
                targetType: 'table',
                targetId: 'missing-table-id',
            },
        });
        setState({ status: 'ready', comments: [] });

        render(<CommentsSection />);

        expect(screen.getByTestId('comments-current-target')).toHaveTextContent(
            'Deleted table'
        );
        expect(screen.queryByText('missing-table-id')).not.toBeInTheDocument();
    });

    it('shows scoped empty states for diagram and target views', () => {
        setLayout({
            discussionView: 'diagram',
            commentsTarget: DIAGRAM_DISCUSSION_TARGET,
        });
        setState({
            status: 'ready',
            comments: [
                createComment({
                    id: 1,
                    body: 'Other scope',
                    targetType: 'table',
                    targetId: 'table-1',
                }),
            ],
        });

        const { rerender } = render(<CommentsSection />);
        expect(screen.getByText('No diagram messages yet')).toBeInTheDocument();
        expect(screen.queryByText('Other scope')).not.toBeInTheDocument();

        setLayout({
            discussionView: 'target',
            commentsTarget: {
                targetType: 'field',
                targetId: 'field-1',
            },
        });
        rerender(<CommentsSection />);
        expect(
            screen.getByText('No messages for this selection yet')
        ).toBeInTheDocument();
    });

    it('retains scoped comments during reload loading and error', () => {
        setLayout({
            discussionView: 'target',
            commentsTarget: {
                targetType: 'table',
                targetId: 'table-1',
            },
        });
        setState({
            status: 'loading',
            comments: [
                createComment({
                    id: 1,
                    body: 'Scoped keep',
                    targetType: 'table',
                    targetId: 'table-1',
                }),
                createComment({ id: 2, body: 'Diagram other' }),
            ],
        });

        const { rerender } = render(<CommentsSection />);
        expect(screen.getByText('Scoped keep')).toBeInTheDocument();
        expect(screen.queryByText('Diagram other')).not.toBeInTheDocument();

        setState({
            status: 'error',
            error: new Error('reload failed'),
            comments: [
                createComment({
                    id: 1,
                    body: 'Scoped keep',
                    targetType: 'table',
                    targetId: 'table-1',
                }),
                createComment({ id: 2, body: 'Diagram other' }),
            ],
        });
        rerender(<CommentsSection />);
        expect(screen.getByText('Scoped keep')).toBeInTheDocument();
        expect(screen.queryByText('Diagram other')).not.toBeInTheDocument();
    });

    it('forwards a changed target to the composer', () => {
        setLayout({
            discussionView: 'target',
            commentsTarget: {
                targetType: 'table',
                targetId: 'table-1',
            },
        });
        setState({ status: 'ready', comments: [] });

        const { rerender } = render(<CommentsSection />);
        expect(screen.getByTestId('comments-composer')).toHaveAttribute(
            'data-target-id',
            'table-1'
        );

        setLayout({
            discussionView: 'target',
            commentsTarget: {
                targetType: 'field',
                targetId: 'field-1',
            },
        });
        rerender(<CommentsSection />);
        expect(screen.getByTestId('comments-composer')).toHaveAttribute(
            'data-target-type',
            'field'
        );
        expect(screen.getByTestId('comments-composer')).toHaveAttribute(
            'data-target-id',
            'field-1'
        );
    });

    it('hides the composer while diagram access is unknown', () => {
        accessState.available = false;
        setLayout({
            discussionView: 'diagram',
            commentsTarget: DIAGRAM_DISCUSSION_TARGET,
        });
        setState({ status: 'ready', comments: [] });

        render(<CommentsSection />);

        expect(
            screen.queryByTestId('comments-composer')
        ).not.toBeInTheDocument();
    });

    it('shows scoped empty and reload banner when target is empty but global comments exist', async () => {
        const user = userEvent.setup();
        const reload = vi.fn(async () => undefined);
        setLayout({
            discussionView: 'target',
            commentsTarget: {
                targetType: 'table',
                targetId: 'table-1',
            },
        });
        setState({
            status: 'error',
            error: new Error('secret reload failure'),
            comments: [
                createComment({
                    id: 1,
                    body: 'Other target only',
                    targetType: 'table',
                    targetId: 'table-other',
                }),
            ],
            reload,
        });

        render(<CommentsSection />);

        expect(
            screen.getByText('No messages for this selection yet')
        ).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
            screen.queryByText('Could not load discussions')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText('secret reload failure')
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('comments-composer')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Retry' }));
        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('shows diagram empty and reload banner when diagram scope is empty but entity comments exist', () => {
        setLayout({
            discussionView: 'diagram',
            commentsTarget: DIAGRAM_DISCUSSION_TARGET,
        });
        setState({
            status: 'error',
            error: new Error('secret reload failure'),
            comments: [
                createComment({
                    id: 1,
                    body: 'Entity only',
                    targetType: 'table',
                    targetId: 'table-1',
                }),
            ],
        });

        render(<CommentsSection />);

        expect(screen.getByText('No diagram messages yet')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
            screen.queryByText('Could not load discussions')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText('secret reload failure')
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('comments-composer')).toBeInTheDocument();
    });

    it.each([
        {
            label: 'table',
            target: { targetType: 'table' as const, targetId: 'gone-table' },
            missingLabel: 'Deleted table',
        },
        {
            label: 'field',
            target: { targetType: 'field' as const, targetId: 'gone-field' },
            missingLabel: 'Deleted field',
        },
        {
            label: 'relationship',
            target: {
                targetType: 'relationship' as const,
                targetId: 'gone-rel',
            },
            missingLabel: 'Deleted relationship',
        },
    ])(
        'hides the composer for a missing $label target while keeping history readable',
        ({ target, missingLabel }) => {
            setLayout({
                discussionView: 'target',
                commentsTarget: target,
            });
            setState({
                status: 'ready',
                comments: [
                    createComment({
                        id: 1,
                        body: 'Historical orphan',
                        targetType: target.targetType,
                        targetId: target.targetId,
                    }),
                ],
            });

            render(<CommentsSection />);

            expect(
                screen.getByTestId('comments-current-target')
            ).toHaveTextContent(missingLabel);
            expect(screen.getByText('Historical orphan')).toBeInTheDocument();
            expect(
                screen.queryByTestId('comments-composer')
            ).not.toBeInTheDocument();
            expect(screen.queryByText(target.targetId)).not.toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'All' })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Diagram' })
            ).toBeInTheDocument();
        }
    );

    it('keeps missing-target read-only for viewers', () => {
        accessState.can_edit = false;
        setLayout({
            discussionView: 'target',
            commentsTarget: {
                targetType: 'table',
                targetId: 'gone-table',
            },
        });
        setState({
            status: 'ready',
            comments: [
                createComment({
                    id: 1,
                    body: 'Viewer history',
                    targetType: 'table',
                    targetId: 'gone-table',
                }),
            ],
        });

        render(<CommentsSection />);

        expect(screen.getByText('Viewer history')).toBeInTheDocument();
        expect(screen.getByTestId('comments-current-target')).toHaveTextContent(
            'Deleted table'
        );
        expect(
            screen.queryByTestId('comments-composer')
        ).not.toBeInTheDocument();
    });

    it('still shows the composer for a valid table target and diagram view', () => {
        setLayout({
            discussionView: 'target',
            commentsTarget: {
                targetType: 'table',
                targetId: 'table-1',
            },
        });
        setState({ status: 'ready', comments: [] });

        const { rerender } = render(<CommentsSection />);
        expect(screen.getByTestId('comments-composer')).toBeInTheDocument();

        setLayout({
            discussionView: 'diagram',
            commentsTarget: DIAGRAM_DISCUSSION_TARGET,
        });
        rerender(<CommentsSection />);
        expect(screen.getByTestId('comments-composer')).toHaveAttribute(
            'data-target-type',
            'diagram'
        );
    });
});
