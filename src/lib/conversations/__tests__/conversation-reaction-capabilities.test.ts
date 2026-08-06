import { describe, expect, it } from 'vitest';
import type { DiagramAccess } from '@/lib/api/diagrams';
import { canReactToConversationMessage } from '../conversation-reaction-capabilities';
import {
    canCreateConversationMessage,
    getConversationMessageCapabilities,
} from '../conversation-message-capabilities';
import { aliceWonderAuthor } from '@/test/user-identity-fixtures';

const ownerAccess: DiagramAccess = {
    role: 'owner',
    can_edit: true,
    can_manage_members: true,
};

const editorAccess: DiagramAccess = {
    role: 'editor',
    can_edit: true,
    can_manage_members: false,
};

const viewerAccess: DiagramAccess = {
    role: 'viewer',
    can_edit: false,
    can_manage_members: false,
};

describe('canReactToConversationMessage', () => {
    it('allows owner, editor, and viewer on active conversations', () => {
        for (const diagramAccess of [ownerAccess, editorAccess, viewerAccess]) {
            expect(
                canReactToConversationMessage({
                    isConversationsActive: true,
                    conversationStatus: 'active',
                    diagramAccess,
                })
            ).toBe(true);
        }
    });

    it('denies archived conversations and inactive scope', () => {
        expect(
            canReactToConversationMessage({
                isConversationsActive: true,
                conversationStatus: 'archived',
                diagramAccess: editorAccess,
            })
        ).toBe(false);

        expect(
            canReactToConversationMessage({
                isConversationsActive: false,
                conversationStatus: 'active',
                diagramAccess: editorAccess,
            })
        ).toBe(false);

        expect(
            canReactToConversationMessage({
                isConversationsActive: true,
                conversationStatus: 'active',
                diagramAccess: null,
            })
        ).toBe(false);
    });
});

describe('viewer reaction permissions stay separate from composer permissions', () => {
    it('allows viewers to react but not create messages', () => {
        expect(canCreateConversationMessage(viewerAccess, 'active')).toBe(
            false
        );
        expect(
            canReactToConversationMessage({
                isConversationsActive: true,
                conversationStatus: 'active',
                diagramAccess: viewerAccess,
            })
        ).toBe(true);
    });

    it('does not grant edit/delete actions to viewers on others messages', () => {
        const capabilities = getConversationMessageCapabilities({
            message: { user: aliceWonderAuthor },
            currentUserId: 99,
            diagramAccess: viewerAccess,
            conversationStatus: 'active',
        });

        expect(capabilities.canEdit).toBe(false);
        expect(capabilities.canDelete).toBe(false);
        expect(capabilities.hasActions).toBe(false);
    });
});
