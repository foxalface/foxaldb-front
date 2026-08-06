import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveConversationMessageMutationError } from '@/lib/conversations/format-conversation-message-mutation-error';

interface DeleteSession {
    conversationId: number;
    generation: number;
}

const sessionsEqual = (a: DeleteSession, b: DeleteSession): boolean =>
    a.conversationId === b.conversationId && a.generation === b.generation;

export interface UseConversationDeleteSessionArgs {
    conversationId: number;
    open: boolean;
    onConfirmDelete: (conversationId: number) => Promise<void>;
    onDeleted: () => void;
    onOpenChange: (open: boolean) => void;
}

export interface UseConversationDeleteSessionResult {
    isPending: boolean;
    errorMessage: string | null;
    confirmDelete: () => Promise<void>;
    handleOpenChange: (nextOpen: boolean) => void;
}

export const useConversationDeleteSession = ({
    conversationId,
    open,
    onConfirmDelete,
    onDeleted,
    onOpenChange,
}: UseConversationDeleteSessionArgs): UseConversationDeleteSessionResult => {
    const { t } = useTranslation();

    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const deleteInFlightRef = useRef(false);
    const isMountedRef = useRef(true);
    const openRef = useRef(open);
    const sessionRef = useRef<DeleteSession>({
        conversationId,
        generation: 0,
    });
    const onConfirmDeleteRef = useRef(onConfirmDelete);
    const onDeletedRef = useRef(onDeleted);
    const onOpenChangeRef = useRef(onOpenChange);

    openRef.current = open;
    onConfirmDeleteRef.current = onConfirmDelete;
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
            conversationId,
            generation: sessionRef.current.generation + 1,
        };
        deleteInFlightRef.current = false;
        setIsPending(false);
        setErrorMessage(null);
    }, [conversationId]);

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
                    'side_panel.conversations_section.summary.delete_dialog.errors.forbidden'
                );
            }

            if (resolved.key === 'not_found') {
                return t(
                    'side_panel.conversations_section.summary.delete_dialog.errors.not_found'
                );
            }

            return t(
                'side_panel.conversations_section.summary.delete_dialog.errors.delete_failed'
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
        if (deleteInFlightRef.current || !openRef.current) {
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
            await onConfirmDeleteRef.current(submissionSession.conversationId);

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
    }, [resolveDeleteErrorMessage]);

    return {
        isPending,
        errorMessage,
        confirmDelete,
        handleOpenChange,
    };
};
