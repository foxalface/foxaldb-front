import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { SidebarSection } from '@/context/layout-context/layout-context';

const frontendSrcRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../..'
);

const readSrcFile = (relativePath: string): string =>
    readFileSync(resolve(frontendSrcRoot, relativePath), 'utf8');

const productionSrcFiles = (): string[] => {
    const collected: string[] = [];
    const walk = (relativeDir: string): void => {
        for (const entry of readdirSync(resolve(frontendSrcRoot, relativeDir), {
            withFileTypes: true,
        })) {
            const relativePath = `${relativeDir}/${entry.name}`;
            if (entry.isDirectory()) {
                if (
                    relativePath.includes('/__tests__') ||
                    relativePath.endsWith('/__tests__')
                ) {
                    continue;
                }
                walk(relativePath);
                continue;
            }
            if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
                collected.push(relativePath);
            }
        }
    };
    walk('.');
    return collected;
};

const FORBIDDEN_PRODUCTION_PATTERNS: Array<{
    label: string;
    pattern: RegExp;
}> = [
    { label: 'CommentsProvider', pattern: /\bCommentsProvider\b/ },
    { label: 'comments-context', pattern: /comments-context/ },
    { label: 'CommentsSection', pattern: /\bCommentsSection\b/ },
    { label: 'DiscussionIndicator', pattern: /\bDiscussionIndicator\b/ },
    {
        label: 'diagram-comments API',
        pattern: /diagram-comments/,
    },
    {
        label: 'comment-subscriber',
        pattern: /comment-subscriber/,
    },
    {
        label: 'subscribeToDiagramCommentEvents',
        pattern: /subscribeToDiagramCommentEvents/,
    },
    {
        label: 'DiagramCommentEventChannel',
        pattern: /DiagramCommentEventChannel/,
    },
    {
        label: 'useCommentsAvailability',
        pattern: /useCommentsAvailability/,
    },
    {
        label: 'useDiagramComments',
        pattern: /useDiagramComments/,
    },
    {
        label: 'useTargetComments',
        pattern: /useTargetComments/,
    },
    {
        label: 'useCommentMutations',
        pattern: /useCommentMutations/,
    },
    {
        label: 'useDiscussionIndicators',
        pattern: /useDiscussionIndicators/,
    },
    {
        label: 'useDiscussionScroll',
        pattern: /useDiscussionScroll/,
    },
    {
        label: 'openAllDiscussions',
        pattern: /openAllDiscussions/,
    },
    {
        label: 'openDiagramDiscussion',
        pattern: /openDiagramDiscussion/,
    },
    {
        label: 'openTargetDiscussion',
        pattern: /openTargetDiscussion/,
    },
    {
        label: 'legacy_comments translation key',
        pattern: /legacy_comments/,
    },
    {
        label: 'legacy_comments_section translation key',
        pattern: /legacy_comments_section/,
    },
    {
        label: 'comments sidebar section',
        pattern: /selectedSidebarSection === 'comments'/,
    },
];

describe('M12.2 comments cutover architecture', () => {
    it('does not mount CommentsProvider in editor-page', () => {
        const editorPage = readSrcFile('pages/editor-page/editor-page.tsx');

        expect(editorPage).not.toContain('CommentsProvider');
        expect(editorPage).toContain('ConversationsProvider');
    });

    it('keeps ConversationsProvider mounted exactly once in editor-page', () => {
        const editorPage = readSrcFile('pages/editor-page/editor-page.tsx');
        const matches = editorPage.match(/<ConversationsProvider>/g) ?? [];

        expect(matches).toHaveLength(1);
    });

    it('removes comments from SidebarSection union', () => {
        const layoutContext = readSrcFile(
            'context/layout-context/layout-context.tsx'
        );

        expect(layoutContext).not.toMatch(/'comments'/);
        const sectionUnion = layoutContext.match(
            /export type SidebarSection =[\s\S]*?;/
        )?.[0];
        expect(sectionUnion).toBeDefined();
        expect(sectionUnion).toContain("'conversations'");
    });

    it('has no forbidden legacy Comments references in production source', () => {
        const offenders: string[] = [];

        for (const file of productionSrcFiles()) {
            const source = readSrcFile(file);
            for (const { label, pattern } of FORBIDDEN_PRODUCTION_PATTERNS) {
                if (pattern.test(source)) {
                    offenders.push(`${file}: ${label}`);
                }
            }
        }

        expect(offenders).toEqual([]);
    });

    it('uses neutral diagram private channel typing in realtime context', () => {
        const realtimeContext = readSrcFile(
            'context/realtime-context/realtime-context.tsx'
        );

        expect(realtimeContext).toContain('DiagramPrivateEventChannel');
        expect(realtimeContext).not.toContain('DiagramCommentEventChannel');
    });

    it('keeps conversation subscriber subscribed without comment subscriber', () => {
        const conversationsProvider = readSrcFile(
            'context/conversations-context/conversations-provider.tsx'
        );

        expect(conversationsProvider).toContain(
            'subscribeToDiagramConversationEvents'
        );
        expect(conversationsProvider).not.toContain(
            'subscribeToDiagramCommentEvents'
        );
    });

    it('uses shared datetime helpers for conversation message timestamps', () => {
        const intlLocaleHelper = readSrcFile('lib/i18n/intl-locale.ts');
        const datetimeHelper = readSrcFile(
            'lib/conversations/conversation-message-datetime.ts'
        );
        const messageItem = readSrcFile(
            'pages/editor-page/side-panel/conversations-section/conversation-message-item.tsx'
        );

        expect(intlLocaleHelper).toContain('resolveIntlLocale');
        expect(datetimeHelper).toContain('formatConversationMessageTime');
        expect(messageItem).toContain(
            '@/lib/conversations/conversation-message-datetime'
        );
    });

    it('documents SidebarSection excludes comments at type level', () => {
        const commentsSection: SidebarSection = 'conversations';
        expect(commentsSection).toBe('conversations');
    });
});
