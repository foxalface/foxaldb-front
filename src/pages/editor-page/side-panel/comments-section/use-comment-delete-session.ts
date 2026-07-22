import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommentMutations } from '@/hooks/use-comment-mutations';
import type { DiagramComment } from '@/lib/comments/comment-types';

interface DeleteSession {
    commentId: number;
    diagramId: string;
    generation: number;
}

const sessionsEqual = (a: DeleteSession, b: DeleteSession): boolean =>
    a.commentId === b.commentId &&
    a.diagramId === b.diagramId &&
    a.generation === b.generation;

export interface UseCommentDeleteSessionArgs {
    comment: DiagramComment;
    diagramId: string;
    open: boolean;
    onDeleted: () => void;
    onOpenChange: (open: boolean) => void;
}

export interface UseCommentDeleteSessionResult {
    isPending: boolean;
    errorMessage: string | null;
    confirmDelete: () => Promise<void>;
    handleOpenChange: (nextOpen: boolean) => void;
}

/**
 * Owns pending state, mutation error, synchronous lock, mounted safety,
 * and session generation for confirmed comment deletion.
 */
export const useCommentDeleteSession = ({
    comment,
    diagramId,
    open,
    onDeleted,
    onOpenChange,
}: UseCommentDeleteSessionArgs): UseCommentDeleteSessionResult => {
    const { t } = useTranslation();
    const { deleteComment } = useCommentMutations();

    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const deleteInFlightRef = useRef(false);
    const isMountedRef = useRef(true);
    const openRef = useRef(open);
    const sessionRef = useRef<DeleteSession>({
        commentId: comment.id,
        diagramId,
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
            commentId: comment.id,
            diagramId,
            generation: sessionRef.current.generation + 1,
        };
        deleteInFlightRef.current = false;
        setIsPending(false);
        setErrorMessage(null);
    }, [comment.id, diagramId]);

    useEffect(() => {
        if (open) {
            setErrorMessage(null);
        }
    }, [open]);

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
        const commentId = submissionSession.commentId;

        deleteInFlightRef.current = true;
        setIsPending(true);
        setErrorMessage(null);

        const isCurrentSession = () =>
            isMountedRef.current &&
            openRef.current &&
            sessionsEqual(sessionRef.current, submissionSession);

        try {
            await deleteComment(commentId);

            if (!isCurrentSession()) {
                return;
            }

            setErrorMessage(null);
            onOpenChangeRef.current(false);
            onDeletedRef.current();
        } catch {
            if (!isCurrentSession()) {
                return;
            }

            setErrorMessage(
                t(
                    'side_panel.comments_section.delete_dialog.errors.delete_failed'
                )
            );
        } finally {
            if (sessionsEqual(sessionRef.current, submissionSession)) {
                deleteInFlightRef.current = false;
                if (isMountedRef.current) {
                    setIsPending(false);
                }
            }
        }
    }, [deleteComment, t]);

    return {
        isPending,
        errorMessage,
        confirmDelete,
        handleOpenChange,
    };
};
