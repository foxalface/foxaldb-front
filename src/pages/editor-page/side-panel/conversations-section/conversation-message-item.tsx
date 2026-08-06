import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import TimeAgo from 'timeago-react';
import { useTranslation } from 'react-i18next';
import { register as registerLocale } from 'timeago.js';
import { Avatar, AvatarFallback } from '@/components/avatar/avatar';
import {
    ConversationMessage,
    ConversationMessageAuthor,
    ConversationMessageAvatar,
    ConversationMessageBody,
    ConversationMessageBodyText,
    ConversationMessageContent,
    ConversationMessageFooter,
    ConversationMessageHeader,
    ConversationMessageHeaderMeta,
    ConversationMessageHeaderTitleRow,
    ConversationMessageLayout,
} from '@/components/conversation-message';
import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { ConversationMessageReactionsBar } from '@/components/conversation-message/conversation-message-reactions-bar';
import { getConversationMessageCapabilities } from '@/lib/conversations/conversation-message-capabilities';
import { canReactToConversationMessage } from '@/lib/conversations/conversation-reaction-capabilities';
import type {
    ConversationStatus,
    DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';
import { getUserInitials } from '@/lib/user';
import { resolveTimeAgoLocale } from '@/lib/i18n/timeago-locale';
import { ConversationMessageActionsMenu } from './conversation-message-actions-menu';
import { ConversationMessageDeleteDialog } from './conversation-message-delete-dialog';
import { ConversationMessageEditForm } from './conversation-message-edit-form';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';

export interface ConversationMessageItemProps {
    message: DiagramConversationMessage;
    conversationId: number;
    conversationStatus: ConversationStatus;
    editingMessageId: number | null;
    onStartEdit: (messageId: number) => void;
    onCancelEdit: () => void;
    onEditSaved: () => void;
}

const parseTimestamp = (
    timestamp: string
): { date: Date; exactLabel: string } | null => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return {
        date,
        exactLabel: date.toLocaleString(),
    };
};

const registerTimeAgoLanguage = (language: string): string => {
    const { locale, lang } = resolveTimeAgoLocale(language);
    registerLocale(lang, locale);
    return lang;
};

const isMessageEdited = (message: DiagramConversationMessage): boolean =>
    message.updatedAt !== message.createdAt;

export const ConversationMessageItem: React.FC<
    ConversationMessageItemProps
> = ({
    message,
    conversationId,
    conversationStatus,
    editingMessageId,
    onStartEdit,
    onCancelEdit,
    onEditSaved,
}) => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { diagramAccess } = useDiagramAccess();
    const isConversationsActive = useConversationsAvailability();
    const [timeAgoLocale, setTimeAgoLocale] = useState(() =>
        registerTimeAgoLanguage(i18n.language)
    );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const actionsTriggerRef = useRef<HTMLButtonElement>(null);
    const shouldFocusActionsRef = useRef(false);
    const shouldRestoreDeleteFocusRef = useRef(false);

    const isEditing = editingMessageId === message.id;
    const isCurrentUser =
        user?.id !== undefined &&
        message.user?.id !== undefined &&
        user.id === message.user.id;

    const capabilities = useMemo(
        () =>
            getConversationMessageCapabilities({
                message,
                currentUserId: user?.id,
                diagramAccess,
                conversationStatus,
            }),
        [conversationStatus, diagramAccess, message, user?.id]
    );

    const canReact = useMemo(
        () =>
            canReactToConversationMessage({
                isConversationsActive,
                conversationStatus,
                diagramAccess,
            }),
        [conversationStatus, diagramAccess, isConversationsActive]
    );

    useLayoutEffect(() => {
        setTimeAgoLocale(registerTimeAgoLanguage(i18n.language));
    }, [i18n.language]);

    useEffect(() => {
        if (isEditing && !capabilities.canEdit) {
            onCancelEdit();
        }
    }, [capabilities.canEdit, isEditing, onCancelEdit]);

    useEffect(() => {
        if (isDeleteDialogOpen && !capabilities.canDelete) {
            shouldRestoreDeleteFocusRef.current = false;
            setIsDeleteDialogOpen(false);
        }
    }, [capabilities.canDelete, isDeleteDialogOpen]);

    useLayoutEffect(() => {
        if (isEditing || !shouldFocusActionsRef.current) {
            return;
        }

        shouldFocusActionsRef.current = false;
        actionsTriggerRef.current?.focus();
    }, [isEditing]);

    const displayName = message.user?.fullName?.trim()
        ? message.user.fullName.trim()
        : t('side_panel.conversations_section.deleted_user');

    const initials = useMemo(() => {
        if (!message.user) {
            return '?';
        }

        return getUserInitials(message.user.firstName, message.user.lastName);
    }, [message.user]);

    const parsedCreatedAt = useMemo(
        () => parseTimestamp(message.createdAt),
        [message.createdAt]
    );

    const edited = isMessageEdited(message);

    const handleEdit = useCallback(() => {
        onStartEdit(message.id);
    }, [message.id, onStartEdit]);

    const handleDelete = useCallback(() => {
        shouldRestoreDeleteFocusRef.current = true;
        setIsDeleteDialogOpen(true);
    }, []);

    const handleDeleteOpenChange = useCallback((open: boolean) => {
        setIsDeleteDialogOpen(open);
        if (open) {
            shouldRestoreDeleteFocusRef.current = true;
        }
    }, []);

    const handleDeleted = useCallback(() => {
        shouldRestoreDeleteFocusRef.current = false;
    }, []);

    const handleDeleteCloseAutoFocus = useCallback(() => {
        if (!shouldRestoreDeleteFocusRef.current || !capabilities.canDelete) {
            return;
        }

        shouldRestoreDeleteFocusRef.current = false;
        actionsTriggerRef.current?.focus();
    }, [capabilities.canDelete]);

    const handleCancelEdit = useCallback(() => {
        onCancelEdit();
        shouldFocusActionsRef.current = true;
    }, [onCancelEdit]);

    const handleSavedEdit = useCallback(() => {
        onEditSaved();
        shouldFocusActionsRef.current = true;
    }, [onEditSaved]);

    return (
        <ConversationMessage
            isCurrentUser={isCurrentUser}
            data-testid={`conversation-message-${message.id}`}
        >
            <ConversationMessageLayout>
                <ConversationMessageAvatar>
                    <Avatar className="size-7" aria-hidden="true">
                        <AvatarFallback className="text-[10px] font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </ConversationMessageAvatar>
                <ConversationMessageContent isCurrentUser={isCurrentUser}>
                    <ConversationMessageHeader>
                        <ConversationMessageHeaderMeta>
                            <ConversationMessageHeaderTitleRow>
                                <ConversationMessageAuthor>
                                    {displayName}
                                </ConversationMessageAuthor>
                                {parsedCreatedAt ? (
                                    <time
                                        className="shrink-0 text-xs text-muted-foreground"
                                        dateTime={message.createdAt}
                                        title={parsedCreatedAt.exactLabel}
                                    >
                                        <TimeAgo
                                            datetime={parsedCreatedAt.date}
                                            locale={timeAgoLocale}
                                        />
                                    </time>
                                ) : null}
                                {edited && !isEditing ? (
                                    <span
                                        className="shrink-0 text-xs text-muted-foreground"
                                        aria-label={t(
                                            'side_panel.conversations_section.detail.message.edited_aria'
                                        )}
                                    >
                                        {t(
                                            'side_panel.conversations_section.detail.message.edited'
                                        )}
                                    </span>
                                ) : null}
                            </ConversationMessageHeaderTitleRow>
                        </ConversationMessageHeaderMeta>
                        {!isEditing ? (
                            <ConversationMessageActionsMenu
                                ref={actionsTriggerRef}
                                canEdit={capabilities.canEdit}
                                canDelete={capabilities.canDelete}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ) : null}
                    </ConversationMessageHeader>
                    {isEditing ? (
                        <ConversationMessageEditForm
                            message={message}
                            conversationId={conversationId}
                            conversationStatus={conversationStatus}
                            onCancel={handleCancelEdit}
                            onSaved={handleSavedEdit}
                        />
                    ) : (
                        <ConversationMessageBody isCurrentUser={isCurrentUser}>
                            <ConversationMessageBodyText>
                                {message.body}
                            </ConversationMessageBodyText>
                        </ConversationMessageBody>
                    )}
                    <ConversationMessageFooter>
                        <ConversationMessageReactionsBar
                            conversationId={conversationId}
                            messageId={message.id}
                            reactions={message.reactions}
                            canReact={canReact}
                            isEditing={isEditing}
                        />
                    </ConversationMessageFooter>
                </ConversationMessageContent>
            </ConversationMessageLayout>
            {capabilities.canDelete ? (
                <ConversationMessageDeleteDialog
                    conversationId={conversationId}
                    messageId={message.id}
                    conversationStatus={conversationStatus}
                    open={isDeleteDialogOpen}
                    onOpenChange={handleDeleteOpenChange}
                    onDeleted={handleDeleted}
                    onCloseAutoFocus={handleDeleteCloseAutoFocus}
                />
            ) : null}
        </ConversationMessage>
    );
};
