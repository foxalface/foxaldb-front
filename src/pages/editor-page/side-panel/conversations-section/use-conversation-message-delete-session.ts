import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConversationMutations } from '@/hooks/use-conversation-mutations';
import type { ConversationStatus } from '@/lib/conversations/conversation-types';
import { resolveConversationMessageMutationError } from '@/lib/conversations/format-conversation-message-mutation-error';

interface DeleteSession {
    messageId: number;
    conversationId: number;
    generation: number;
}

const sessionsEqual = (a: DeleteSession, b: DeleteSession): boolean =>
    a.messageId === b.messageId &&
    a.conversationId === b.conversationId &&
    a.generation === b.generation;

export interface UseConversationMessageDeleteSessionArgs {
    conversationId: number;
    messageId: number;
    conversationStatus: ConversationStatus;
    open: boolean;
    onDeleted: () => void;
    onOpenChange: (open: boolean) => void;
}

export interface UseConversationMessageDeleteSessionResult {
    isPending: boolean;
    errorMessage: string | null;
    confirmDelete: () => Promise<void>;
    handleOpenChange: (nextOpen: boolean) => void;
}

export const useConversationMessageDeleteSession = ({
    conversationId,
    messageId,
    conversationStatus,
    open,
    onDeleted,
    onOpenChange,
}: UseConversationMessageDeleteSessionArgs): UseConversationMessageDeleteSessionResult => {
    const { t } = useTranslation();
    const { deleteMessage } = useConversationMutations();

    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const deleteInFlightRef = useRef(false);
    const isMountedRef = useRef(true);
    const openRef = useRef(open);
    const sessionRef = useRef<DeleteSession>({
        messageId,
        conversationId,
        generation: 0,
    });
    const onDeletedRef = useRef(onDeleted);
    const onOpenChangeRef = useRef(onOpenChange);

    openRef.current = open;
    onDeletedRef.current = onDeleted;
    onOpenChangeRef.current = onOpenChange;

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        sessionRef.current = {
            messageId,
            conversationId,
            generation: sessionRef.current.generation + 1,
        };
        deleteInFlightRef.current = false;
        setIsPending(false);
        setErrorMessage(null);
    }, [conversationId, messageId]);

    useEffect(() => {
        if (open) {
            setErrorMessage(null);
        }
    }, [open]);

    const resolveDeleteErrorMessage = useCallback(
        (error: unknown): string => {
            const resolved = resolveConversationMessageMutationError(error);

            if (resolved.key === 'forbidden') {
                return t(
                    'side_panel.conversations_section.detail.mutation_errors.forbidden'
                );
            }

            if (resolved.key === 'archived') {
                return t(
                    'side_panel.conversations_section.detail.mutation_errors.archived'
                );
            }

            if (resolved.key === 'not_found') {
                return t(
                    'side_panel.conversations_section.detail.mutation_errors.not_found'
                );
            }

            return t(
                'side_panel.conversations_section.detail.delete_dialog.errors.delete_failed'
            );
        },
        [t]
    );

    const handleOpenChange = useCallback((nextOpen: boolean) => {
        if (!nextOpen && deleteInFlightRef.current) {
            return;
        }

        if (!nextOpen) {
            setErrorMessage(null);
        }

        onOpenChangeRef.current(nextOpen);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (
            deleteInFlightRef.current ||
            !openRef.current ||
            conversationStatus !== 'active'
        ) {
            return;
        }

        const submissionSession: DeleteSession = { ...sessionRef.current };

        deleteInFlightRef.current = true;
        setIsPending(true);
        setErrorMessage(null);

        const isCurrentSession = () =>
            isMountedRef.current &&
            openRef.current &&
            sessionsEqual(sessionRef.current, submissionSession);

        try {
            await deleteMessage(
                submissionSession.conversationId,
                submissionSession.messageId
            );

            if (!isCurrentSession()) {
                return;
            }

            setErrorMessage(null);
            onOpenChangeRef.current(false);
            onDeletedRef.current();
        } catch (error) {
            if (!isCurrentSession()) {
                return;
            }

            setErrorMessage(resolveDeleteErrorMessage(error));
        } finally {
            if (sessionsEqual(sessionRef.current, submissionSession)) {
                deleteInFlightRef.current = false;
                if (isMountedRef.current) {
                    setIsPending(false);
                }
            }
        }
    }, [conversationStatus, deleteMessage, resolveDeleteErrorMessage]);

    return {
        isPending,
        errorMessage,
        confirmDelete,
        handleOpenChange,
    };
};
