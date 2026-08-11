import { describe, expect, it } from 'vitest';
import type { DiagramAccess } from '@/lib/api/diagrams';
import {
    canCreateConversationMessage,
    getConversationMessageCapabilities,
} from '@/lib/conversations/conversation-message-capabilities';
import { aliceWonderAuthor, bobAuthor } from '@/test/user-identity-fixtures';

const editorAccess: DiagramAccess = {
    role: 'editor',
    can_edit: true,
    can_manage_members: false,
};

const ownerAccess: DiagramAccess = {
    role: 'owner',
    can_edit: true,
    can_manage_members: true,
};

const viewerAccess: DiagramAccess = {
    role: 'viewer',
    can_edit: false,
    can_manage_members: false,
};

describe('conversation message capabilities', () => {
    it('allows authors with edit access to edit their messages', () => {
        const capabilities = getConversationMessageCapabilities({
            message: { user: aliceWonderAuthor },
            currentUserId: aliceWonderAuthor.id,
            diagramAccess: editorAccess,
            conversationStatus: 'active',
        });

        expect(capabilities.canEdit).toBe(true);
        expect(capabilities.canDelete).toBe(true);
        expect(capabilities.hasActions).toBe(true);
    });

    it('denies delete for diagram owners on other authors messages', () => {
        const capabilities = getConversationMessageCapabilities({
            message: { user: bobAuthor },
            currentUserId: aliceWonderAuthor.id,
            diagramAccess: ownerAccess,
            conversationStatus: 'active',
        });

        expect(capabilities.canEdit).toBe(false);
        expect(capabilities.canDelete).toBe(false);
        expect(capabilities.hasActions).toBe(false);
    });

    it('denies edit and delete for non-authors who are not owners', () => {
        const capabilities = getConversationMessageCapabilities({
            message: { user: bobAuthor },
            currentUserId: aliceWonderAuthor.id,
            diagramAccess: editorAccess,
            conversationStatus: 'active',
        });

        expect(capabilities.canEdit).toBe(false);
        expect(capabilities.canDelete).toBe(false);
        expect(capabilities.hasActions).toBe(false);
    });

    it('denies all actions for archived conversations', () => {
        const capabilities = getConversationMessageCapabilities({
            message: { user: aliceWonderAuthor },
            currentUserId: aliceWonderAuthor.id,
            diagramAccess: editorAccess,
            conversationStatus: 'archived',
        });

        expect(capabilities.canEdit).toBe(false);
        expect(capabilities.canDelete).toBe(false);
        expect(capabilities.hasActions).toBe(false);
    });

    it('denies edit for deleted authors', () => {
        const capabilities = getConversationMessageCapabilities({
            message: { user: null },
            currentUserId: aliceWonderAuthor.id,
            diagramAccess: ownerAccess,
            conversationStatus: 'active',
        });

        expect(capabilities.canEdit).toBe(false);
        expect(capabilities.canDelete).toBe(false);
    });
});

describe('canCreateConversationMessage', () => {
    it('allows editors on active conversations', () => {
        expect(canCreateConversationMessage(editorAccess, 'active')).toBe(true);
    });

    it('denies viewers', () => {
        expect(canCreateConversationMessage(viewerAccess, 'active')).toBe(
            false
        );
    });

    it('denies archived conversations', () => {
        expect(canCreateConversationMessage(editorAccess, 'archived')).toBe(
            false
        );
    });
});
