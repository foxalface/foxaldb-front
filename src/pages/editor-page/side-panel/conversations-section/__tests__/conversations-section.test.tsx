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
import { fr } from '@/i18n/locales/fr';
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
    lastMessageBody: 'Latest update',
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

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({ user: { id: 1 } }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: {
            role: 'editor',
            can_edit: true,
            can_manage_members: false,
        },
    }),
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
import { TooltipProvider } from '@/components/tooltip/tooltip';

const renderSection = () =>
    render(
        <TooltipProvider>
            <ConversationsSection />
        </TooltipProvider>
    );

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

        renderSection();

        expect(screen.getByRole('tab', { name: 'Active' })).toBeInTheDocument();
        expect(
            screen.getByRole('tab', { name: 'Archived' })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { name: 'Conversations' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Start conversation' })
        ).not.toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Active' })).toHaveAttribute(
            'aria-selected',
            'true'
        );
        expect(
            screen.getByRole('tablist', { name: 'Conversation lists' })
        ).toBeInTheDocument();
        expect(document.querySelector('.lucide-archive')).not.toBeNull();
        expect(
            screen.getByRole('tab', { name: 'Active' }).querySelector('svg')
        ).not.toBeNull();
        expect(screen.getByText('Clients')).toBeInTheDocument();
        expect(screen.getByText('Latest update')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.queryByText('2 messages')).not.toBeInTheDocument();
    });

    it('lazy-loads archived summaries when switching to the Archived tab', async () => {
        const user = userEvent.setup();
        renderSection();

        await user.click(screen.getByRole('tab', { name: 'Archived' }));

        await waitFor(() => {
            expect(
                conversationsState.current.loadArchivedSummaries
            ).toHaveBeenCalledTimes(1);
        });
    });

    it('does not reload archived summaries when switching tabs again', async () => {
        const user = userEvent.setup();
        renderSection();

        await user.click(screen.getByRole('tab', { name: 'Archived' }));
        await waitFor(() => {
            expect(
                conversationsState.current.loadArchivedSummaries
            ).toHaveBeenCalledTimes(1);
        });

        await user.click(screen.getByRole('tab', { name: 'Active' }));
        await user.click(screen.getByRole('tab', { name: 'Archived' }));

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

        renderSection();

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

        renderSection();
        await user.click(screen.getByRole('tab', { name: 'Archived' }));

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

        renderSection();

        await user.click(
            screen.getByRole('button', { name: 'Conversation options' })
        );
        await user.click(screen.getByRole('menuitem', { name: 'Archive' }));

        await waitFor(() => {
            expect(mutationsState.archiveConversation).toHaveBeenCalledWith(10);
        });
    });

    it('reopens an archived conversation through the mutation hook', async () => {
        const user = userEvent.setup();
        conversationsState.current.archivedConversations = [
            buildArchivedConversation(),
        ];

        renderSection();
        await user.click(screen.getByRole('tab', { name: 'Archived' }));

        await user.click(
            screen.getByRole('button', { name: 'Conversation options' })
        );
        await user.click(screen.getByRole('menuitem', { name: 'Reopen' }));

        await waitFor(() => {
            expect(mutationsState.reopenConversation).toHaveBeenCalledWith(20);
        });
    });

    it('shows a loading state for the initial active load', () => {
        conversationsState.current.status = 'loading';

        renderSection();

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Loading conversations…')).toBeInTheDocument();
    });

    it('shows an empty state when there are no active conversations', () => {
        renderSection();

        expect(screen.getByText('No conversation')).toBeInTheDocument();
        expect(
            screen.getByText('Create a conversation to get started')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('No active conversations')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(
                'Active conversations for this diagram will appear here.'
            )
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /conversation/i })
        ).toBeNull();
        expect(
            document.querySelector('[data-slot="empty-icon"]')
        ).not.toBeNull();
        expect(
            document.querySelector('[data-slot="empty-title"]')
        ).not.toBeNull();
        expect(
            document.querySelector('[data-slot="empty-description"]')
        ).not.toBeNull();
    });

    it('uses the shared side panel empty state layout for active conversations', () => {
        const source = readFileSync(
            join(
                dirname(fileURLToPath(import.meta.url)),
                '../conversations-empty-state.tsx'
            ),
            'utf8'
        );

        expect(source).toContain(
            '@/components/side-panel-empty-state/side-panel-empty-state'
        );
        expect(source).toContain('SidePanelEmptyStateViewport');
        expect(source).not.toContain('secondaryAction');
    });

    it('uses French active empty-state copy', () => {
        expect(
            fr.translation.side_panel.conversations_section.empty.active_title
        ).toBe('Aucune conversation');
        expect(
            fr.translation.side_panel.conversations_section.empty
                .active_description
        ).toBe('Créer une conversation pour commencer');
    });

    it('keeps archive-specific empty-state copy on the Archived tab', async () => {
        const user = userEvent.setup();
        renderSection();

        await user.click(screen.getByRole('tab', { name: 'Archived' }));

        await waitFor(() => {
            expect(
                screen.getByText('No archived conversations')
            ).toBeInTheDocument();
        });
        expect(
            screen.getByText(
                'Archived conversations will appear here when you close a thread.'
            )
        ).toBeInTheDocument();
        expect(screen.queryByText('No conversation')).not.toBeInTheDocument();
    });

    it('shows an error state with retry for the active tab', async () => {
        const user = userEvent.setup();
        conversationsState.current.status = 'error';
        conversationsState.current.reload = vi.fn(async () => undefined);

        renderSection();

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

        renderSection();

        const optionsButton = screen.getByRole('button', {
            name: 'Conversation options',
        });
        await user.click(optionsButton);
        await user.click(screen.getByRole('menuitem', { name: 'Archive' }));

        await waitFor(() => {
            expect(mutationsState.archiveConversation).toHaveBeenCalledTimes(1);
            expect(optionsButton).toBeDisabled();
        });

        resolveArchive?.();
    });

    it('shows inactive messaging when conversations are unavailable', () => {
        conversationsState.current.isActive = false;

        renderSection();

        expect(
            screen.getByText('Conversations unavailable')
        ).toBeInTheDocument();
    });

    it('uses the shared side panel section tabs primitive', () => {
        const source = readFileSync(
            join(
                dirname(fileURLToPath(import.meta.url)),
                '../conversations-section.tsx'
            ),
            'utf8'
        );

        expect(source).toContain(
            '@/components/side-panel-section-tabs/side-panel-section-tabs'
        );
        expect(source).toContain('SidePanelSectionTabsToolbar');
        expect(source).toContain('SidePanelSectionTabsList');
        expect(source).toContain('SidePanelSectionTabsTrigger');
    });

    it('uses the French archived tab label Archivées', () => {
        expect(
            fr.translation.side_panel.conversations_section.tabs.archives
        ).toBe('Archivées');
        expect(
            fr.translation.side_panel.conversations_section.tabs.active
        ).toBe('Actives');
    });

    it('does not import the conversations API client in UI components', () => {
        const testDir = dirname(fileURLToPath(import.meta.url));
        const sectionDir = join(testDir, '..');
        const files = [
            'conversations-section.tsx',
            'conversations-list.tsx',
            'conversation-summary-item.tsx',
            'conversation-summary-actions-menu.tsx',
            'conversation-summary-delete-dialog.tsx',
            'use-conversation-delete-session.ts',
            'use-conversations-panel.ts',
            'conversation-detail.tsx',
            'conversation-detail-header.tsx',
            'conversation-message-list.tsx',
            'conversation-message-item.tsx',
            'conversation-archive-banner.tsx',
            'use-conversation-detail.ts',
            'use-conversation-panel-navigation.ts',
        ];

        for (const file of files) {
            const source = readFileSync(join(sectionDir, file), 'utf8');
            expect(source).not.toContain('@/lib/api/diagram-conversations');
        }
    });
});
