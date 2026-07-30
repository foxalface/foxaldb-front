import React from 'react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UseDiagramConversationsResult } from '@/hooks/use-diagram-conversations';
import type { UseConversationMutationsResult } from '@/hooks/use-conversation-mutations';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { en } from '@/i18n/locales/en';
import { aliceWonderAuthor } from '@/test/user-identity-fixtures';

const buildActiveConversation = (
    overrides: Partial<DiagramConversation> = {}
): DiagramConversation => ({
    id: 10,
    diagramId: 42,
    targetType: 'table',
    targetId: 'table-1',
    status: 'active',
    archivedAt: null,
    messageCount: 2,
    lastMessageAt: '2026-01-02T12:00:00.000Z',
    lastMessagePreview: 'Latest update',
    lastMessageAuthor: aliceWonderAuthor,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T12:00:00.000Z',
    ...overrides,
});

const buildArchivedConversation = (
    overrides: Partial<DiagramConversation> = {}
): DiagramConversation => ({
    ...buildActiveConversation({
        id: 20,
        status: 'archived',
        archivedAt: '2026-01-03T00:00:00.000Z',
    }),
    ...overrides,
});

const { conversationsState, mutationsState, chartDbState } = vi.hoisted(() => ({
    conversationsState: {
        current: {
            activeConversations: [] as DiagramConversation[],
            archivedConversations: [] as DiagramConversation[],
            status: 'ready' as UseDiagramConversationsResult['status'],
            error: null,
            isActive: true as boolean,
            diagramId: '42',
            activeSummariesNextCursor: null as string | null,
            archivedSummariesNextCursor: null as string | null,
            reload: vi.fn(async () => undefined),
            loadArchivedSummaries: vi.fn(async () => undefined),
            loadMoreActiveSummaries: vi.fn(async () => undefined),
            loadMoreArchivedSummaries: vi.fn(async () => undefined),
        } satisfies UseDiagramConversationsResult,
    },
    mutationsState: {
        archiveConversation: vi.fn(
            async (id: number): Promise<DiagramConversation> =>
                buildArchivedConversation({ id })
        ),
        reopenConversation: vi.fn(
            async (id: number): Promise<DiagramConversation> =>
                buildActiveConversation({ id })
        ),
    },
    chartDbState: {
        diagramName: 'Billing',
        tables: [
            {
                id: 'table-1',
                name: 'Clients',
                x: 0,
                y: 0,
                fields: [],
                indexes: [],
                color: '#fff',
                isView: false,
                createdAt: 0,
            },
        ],
        relationships: [],
    },
}));

vi.mock('@/hooks/use-diagram-conversations', () => ({
    useDiagramConversations: () => conversationsState.current,
}));

vi.mock('@/hooks/use-conversation-mutations', () => ({
    useConversationMutations: (): UseConversationMutationsResult => ({
        findOrCreateConversation: vi.fn(),
        archiveConversation: mutationsState.archiveConversation,
        reopenConversation: mutationsState.reopenConversation,
        deleteConversation: vi.fn(),
        createMessage: vi.fn(),
        updateMessage: vi.fn(),
        deleteMessage: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => chartDbState,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => {
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

            return current.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
                const value = options?.[token];
                return value === undefined || value === null
                    ? ''
                    : String(value);
            });
        },
        i18n: { language: 'en' },
    }),
}));

import { ConversationsSection } from '../conversations-section';

const resetState = () => {
    conversationsState.current = {
        activeConversations: [],
        archivedConversations: [],
        status: 'ready',
        error: null,
        isActive: true,
        diagramId: '42',
        activeSummariesNextCursor: null,
        archivedSummariesNextCursor: null,
        reload: vi.fn(async () => undefined),
        loadArchivedSummaries: vi.fn(async () => undefined),
        loadMoreActiveSummaries: vi.fn(async () => undefined),
        loadMoreArchivedSummaries: vi.fn(async () => undefined),
    };
    mutationsState.archiveConversation = vi.fn(async () =>
        buildArchivedConversation()
    );
    mutationsState.reopenConversation = vi.fn(async () =>
        buildActiveConversation()
    );
};

describe('ConversationsSection', () => {
    beforeEach(() => {
        resetState();
    });

    it('renders the active tab summaries by default', () => {
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];

        render(<ConversationsSection />);

        expect(
            screen.getByRole('heading', { name: 'Conversations' })
        ).toBeInTheDocument();
        expect(screen.getByText('Clients')).toBeInTheDocument();
        expect(screen.getByText('Latest update')).toBeInTheDocument();
        expect(screen.getByText('2 messages')).toBeInTheDocument();
    });

    it('lazy-loads archived summaries when switching to the Archives tab', async () => {
        const user = userEvent.setup();
        render(<ConversationsSection />);

        await user.click(screen.getByRole('tab', { name: 'Archives' }));

        await waitFor(() => {
            expect(
                conversationsState.current.loadArchivedSummaries
            ).toHaveBeenCalledTimes(1);
        });
    });

    it('does not reload archived summaries when switching tabs again', async () => {
        const user = userEvent.setup();
        render(<ConversationsSection />);

        await user.click(screen.getByRole('tab', { name: 'Archives' }));
        await waitFor(() => {
            expect(
                conversationsState.current.loadArchivedSummaries
            ).toHaveBeenCalledTimes(1);
        });

        await user.click(screen.getByRole('tab', { name: 'Active' }));
        await user.click(screen.getByRole('tab', { name: 'Archives' }));

        expect(
            conversationsState.current.loadArchivedSummaries
        ).toHaveBeenCalledTimes(1);
    });

    it('loads more active summaries when pagination is available', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];
        conversationsState.current.activeSummariesNextCursor = 'cursor-1';

        render(<ConversationsSection />);

        await user.click(screen.getByRole('button', { name: 'Load more' }));

        await waitFor(() => {
            expect(
                conversationsState.current.loadMoreActiveSummaries
            ).toHaveBeenCalledTimes(1);
        });
    });

    it('loads more archived summaries when pagination is available', async () => {
        const user = userEvent.setup();
        conversationsState.current.archivedConversations = [
            buildArchivedConversation(),
        ];
        conversationsState.current.archivedSummariesNextCursor = 'cursor-2';

        render(<ConversationsSection />);
        await user.click(screen.getByRole('tab', { name: 'Archives' }));

        await waitFor(() => {
            expect(
                conversationsState.current.loadArchivedSummaries
            ).toHaveBeenCalledTimes(1);
        });

        await user.click(screen.getByRole('button', { name: 'Load more' }));

        await waitFor(() => {
            expect(
                conversationsState.current.loadMoreArchivedSummaries
            ).toHaveBeenCalledTimes(1);
        });
    });

    it('archives an active conversation through the mutation hook', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];

        render(<ConversationsSection />);

        await user.click(
            screen.getByRole('button', {
                name: 'Archive conversation for Clients',
            })
        );

        await waitFor(() => {
            expect(mutationsState.archiveConversation).toHaveBeenCalledWith(10);
        });
    });

    it('reopens an archived conversation through the mutation hook', async () => {
        const user = userEvent.setup();
        conversationsState.current.archivedConversations = [
            buildArchivedConversation(),
        ];

        render(<ConversationsSection />);
        await user.click(screen.getByRole('tab', { name: 'Archives' }));

        await waitFor(() => {
            expect(screen.getByText('Read-only')).toBeInTheDocument();
        });

        await user.click(
            screen.getByRole('button', {
                name: 'Reopen conversation for Clients',
            })
        );

        await waitFor(() => {
            expect(mutationsState.reopenConversation).toHaveBeenCalledWith(20);
        });
    });

    it('shows a loading state for the initial active load', () => {
        conversationsState.current.status = 'loading';

        render(<ConversationsSection />);

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Loading conversations…')).toBeInTheDocument();
    });

    it('shows an empty state when there are no active conversations', () => {
        render(<ConversationsSection />);

        expect(screen.getByText('No active conversations')).toBeInTheDocument();
    });

    it('shows an error state with retry for the active tab', async () => {
        const user = userEvent.setup();
        conversationsState.current.status = 'error';
        conversationsState.current.reload = vi.fn(async () => undefined);

        render(<ConversationsSection />);

        expect(
            screen.getByText('Could not load conversations')
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Retry' }));

        await waitFor(() => {
            expect(conversationsState.current.reload).toHaveBeenCalledTimes(1);
        });
    });

    it('disables archive actions while a mutation is pending', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];
        let resolveArchive: (() => void) | undefined;
        mutationsState.archiveConversation = vi.fn(
            () =>
                new Promise((resolve) => {
                    resolveArchive = () => resolve(buildArchivedConversation());
                })
        );

        render(<ConversationsSection />);

        const archiveButton = screen.getByRole('button', {
            name: 'Archive conversation for Clients',
        });
        await user.click(archiveButton);

        await waitFor(() => {
            expect(archiveButton).toBeDisabled();
            expect(archiveButton).toHaveTextContent('Archiving…');
        });

        resolveArchive?.();
    });

    it('shows inactive messaging when conversations are unavailable', () => {
        conversationsState.current.isActive = false;

        render(<ConversationsSection />);

        expect(
            screen.getByText('Conversations unavailable')
        ).toBeInTheDocument();
    });

    it('does not import the conversations API client in UI components', () => {
        const testDir = dirname(fileURLToPath(import.meta.url));
        const sectionDir = join(testDir, '..');
        const files = [
            'conversations-section.tsx',
            'conversations-list.tsx',
            'conversation-summary-item.tsx',
            'use-conversations-panel.ts',
        ];

        for (const file of files) {
            const source = readFileSync(join(sectionDir, file), 'utf8');
            expect(source).not.toContain('@/lib/api/diagram-conversations');
        }
    });
});
