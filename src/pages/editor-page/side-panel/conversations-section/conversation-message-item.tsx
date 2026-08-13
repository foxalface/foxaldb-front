import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '@/components/avatar/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import {
    ConversationMessage,
    ConversationMessageActions,
    ConversationMessageAvatar,
    ConversationMessageBody,
    ConversationMessageBodyRow,
    ConversationMessageBodyColumn,
    ConversationMessageBodyText,
    ConversationMessageContent,
    ConversationMessageFooter,
    CONVERSATION_MESSAGE_META_TEXT_CLASS,
    ConversationMessageRow,
    ConversationMessageTimestamp,
} from '@/components/conversation-message';
import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useUserTimeZone } from '@/hooks/use-user-time-zone';
import { ConversationMessageReactionsBar } from '@/components/conversation-message/conversation-message-reactions-bar';
import { getConversationMessageCapabilities } from '@/lib/conversations/conversation-message-capabilities';
import { canReactToConversationMessage } from '@/lib/conversations/conversation-reaction-capabilities';
import type {
    ConversationStatus,
    DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';
import { getUserInitials } from '@/lib/user';
import { cn } from '@/lib/utils';
import { resolveIntlLocale } from '@/lib/i18n/intl-locale';
import {
    formatConversationMessageExactTooltip,
    formatConversationMessageTime,
} from '@/lib/conversations/conversation-message-datetime';
import { ConversationMessageActionsMenu } from './conversation-message-actions-menu';
import { ConversationMessageDeleteDialog } from './conversation-message-delete-dialog';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';

export interface ConversationMessageItemProps {
    message: DiagramConversationMessage;
    conversationId: number;
    conversationStatus: ConversationStatus;
    editingMessageId: number | null;
    onStartEdit: (messageId: number) => void;
    onCancelEdit: () => void;
}

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
}) => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { diagramAccess } = useDiagramAccess();
    const isConversationsActive = useConversationsAvailability();
    const timeZone = useUserTimeZone();
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

    const intlLocale = useMemo(
        () => resolveIntlLocale(i18n.language),
        [i18n.language]
    );

    const messageTimeLabel = useMemo(
        () =>
            formatConversationMessageTime(
                message.createdAt,
                intlLocale,
                timeZone
            ),
        [intlLocale, message.createdAt, timeZone]
    );

    const messageTimeTooltip = useMemo(
        () =>
            formatConversationMessageExactTooltip(
                message.createdAt,
                intlLocale,
                timeZone
            ),
        [intlLocale, message.createdAt, timeZone]
    );

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

    const showEditedMarker = edited && !isEditing;

    const messageTimestamp = messageTimeLabel ? (
        <ConversationMessageTimestamp
            className={cn(
                isCurrentUser ? 'mr-1.5 justify-end' : 'ml-1.5 justify-start'
            )}
        >
            <span
                className={cn(
                    'relative block',
                    isCurrentUser ? 'text-right' : 'text-left'
                )}
            >
                <time
                    className={CONVERSATION_MESSAGE_META_TEXT_CLASS}
                    dateTime={message.createdAt}
                    title={messageTimeTooltip ?? undefined}
                >
                    {messageTimeLabel}
                </time>
                {showEditedMarker ? (
                    <span
                        className={cn(
                            CONVERSATION_MESSAGE_META_TEXT_CLASS,
                            'absolute top-full mt-px whitespace-nowrap',
                            isCurrentUser ? 'right-0' : 'left-0'
                        )}
                        data-testid="conversation-message-edited-marker"
                        aria-label={t(
                            'side_panel.conversations_section.detail.message.edited_aria'
                        )}
                    >
                        {t(
                            'side_panel.conversations_section.detail.message.edited'
                        )}
                    </span>
                ) : null}
            </span>
        </ConversationMessageTimestamp>
    ) : null;

    return (
        <TooltipProvider>
            <ConversationMessage
                isCurrentUser={isCurrentUser}
                data-testid={`conversation-message-${message.id}`}
                data-editing={isEditing ? 'true' : undefined}
            >
                <ConversationMessageRow isCurrentUser={isCurrentUser}>
                    <ConversationMessageContent isCurrentUser={isCurrentUser}>
                        <ConversationMessageBodyRow>
                            {!isCurrentUser ? (
                                <ConversationMessageAvatar>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span
                                                className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                role="img"
                                                aria-label={displayName}
                                                data-testid="conversation-message-avatar-trigger"
                                            >
                                                <Avatar
                                                    className="size-7"
                                                    aria-hidden="true"
                                                >
                                                    <AvatarFallback className="text-[10px] font-medium">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {displayName}
                                        </TooltipContent>
                                    </Tooltip>
                                </ConversationMessageAvatar>
                            ) : null}
                            {isCurrentUser ? messageTimestamp : null}
                            <ConversationMessageBodyColumn
                                isCurrentUser={isCurrentUser}
                            >
                                <ConversationMessageBody
                                    isCurrentUser={isCurrentUser}
                                    className={
                                        isEditing
                                            ? 'ring-2 ring-pink-600/60'
                                            : undefined
                                    }
                                >
                                    <ConversationMessageBodyText>
                                        {message.body}
                                    </ConversationMessageBodyText>
                                </ConversationMessageBody>
                                <ConversationMessageFooter
                                    isCurrentUser={isCurrentUser}
                                >
                                    <ConversationMessageReactionsBar
                                        conversationId={conversationId}
                                        messageId={message.id}
                                        reactions={message.reactions}
                                        canReact={canReact}
                                        isEditing={isEditing}
                                    />
                                </ConversationMessageFooter>
                            </ConversationMessageBodyColumn>
                            {!isCurrentUser ? messageTimestamp : null}
                            {isCurrentUser && !isEditing ? (
                                <ConversationMessageActions>
                                    <ConversationMessageActionsMenu
                                        ref={actionsTriggerRef}
                                        canEdit={capabilities.canEdit}
                                        canDelete={capabilities.canDelete}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </ConversationMessageActions>
                            ) : null}
                        </ConversationMessageBodyRow>
                    </ConversationMessageContent>
                </ConversationMessageRow>
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
        </TooltipProvider>
    );
};
