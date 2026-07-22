import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommentMutations } from '@/hooks/use-comment-mutations';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { countUnicodeCharacters } from '@/lib/comments/count-unicode-characters';

// Keep in sync with backend DiagramCommentController validation.
const MAX_BODY_LENGTH = 2000;

interface EditSession {
    commentId: number;
    diagramId: string;
    generation: number;
}

const sessionsEqual = (a: EditSession, b: EditSession): boolean =>
    a.commentId === b.commentId &&
    a.diagramId === b.diagramId &&
    a.generation === b.generation;

export interface UseCommentEditSessionArgs {
    comment: DiagramComment;
    diagramId: string;
    onCancel: () => void;
    onSaved: () => void;
    onRequestFocus: () => void;
}

export interface UseCommentEditSessionResult {
    body: string;
    isSubmitting: boolean;
    showRemoteWarning: boolean;
    characterCount: number;
    isEmpty: boolean;
    isTooLong: boolean;
    canSave: boolean;
    errorMessage: string | null;
    maxBodyLength: number;
    setBodyFromInput: (value: string) => void;
    save: () => Promise<void>;
    cancel: () => void;
}

/**
 * Owns draft, validation, mutation, conflict, and session lifecycle for
 * inline comment editing. Presentation and DOM focus stay in CommentEditForm.
 */
export const useCommentEditSession = ({
    comment,
    diagramId,
    onCancel,
    onSaved,
    onRequestFocus,
}: UseCommentEditSessionArgs): UseCommentEditSessionResult => {
    const { t } = useTranslation();
    const { updateComment } = useCommentMutations();

    const [body, setBody] = useState(() => comment.body);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showRemoteWarning, setShowRemoteWarning] = useState(false);

    const updateInFlightRef = useRef(false);
    const isMountedRef = useRef(true);
    const baselineUpdatedAtRef = useRef(comment.updatedAt);
    const latestUpdatedAtRef = useRef(comment.updatedAt);
    const commentSnapshotRef = useRef(comment);
    const sessionRef = useRef<EditSession>({
        commentId: comment.id,
        diagramId,
        generation: 0,
    });
    const onCancelRef = useRef(onCancel);
    const onSavedRef = useRef(onSaved);
    const onRequestFocusRef = useRef(onRequestFocus);

    commentSnapshotRef.current = comment;
    latestUpdatedAtRef.current = comment.updatedAt;
    onCancelRef.current = onCancel;
    onSavedRef.current = onSaved;
    onRequestFocusRef.current = onRequestFocus;

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const latest = commentSnapshotRef.current;
        sessionRef.current = {
            commentId: comment.id,
            diagramId,
            generation: sessionRef.current.generation + 1,
        };
        baselineUpdatedAtRef.current = latest.updatedAt;
        latestUpdatedAtRef.current = latest.updatedAt;
        setBody(latest.body);
        updateInFlightRef.current = false;
        setIsSubmitting(false);
        setValidationError(null);
        setSubmitError(null);
        setShowRemoteWarning(false);
    }, [comment.id, diagramId]);

    useEffect(() => {
        if (
            comment.updatedAt !== baselineUpdatedAtRef.current &&
            !updateInFlightRef.current
        ) {
            setShowRemoteWarning(true);
        }
    }, [comment.updatedAt]);

    const trimmedBody = body.trim();
    const characterCount = countUnicodeCharacters(trimmedBody);
    const isEmpty = characterCount === 0;
    const isTooLong = characterCount > MAX_BODY_LENGTH;
    const canSave = !isEmpty && !isTooLong && !isSubmitting;
    const errorMessage = validationError ?? submitError;

    const setBodyFromInput = useCallback(
        (value: string) => {
            setBody(value);
            setSubmitError(null);
            const nextCount = countUnicodeCharacters(value.trim());
            if (nextCount > MAX_BODY_LENGTH) {
                setValidationError(
                    t('side_panel.comments_section.edit.errors.too_long')
                );
            } else {
                setValidationError(null);
            }
        },
        [t]
    );

    const save = useCallback(async () => {
        if (updateInFlightRef.current) {
            return;
        }

        const nextTrimmedBody = body.trim();
        const nextCount = countUnicodeCharacters(nextTrimmedBody);

        if (nextCount > MAX_BODY_LENGTH) {
            setValidationError(
                t('side_panel.comments_section.edit.errors.too_long')
            );
            setSubmitError(null);
            onRequestFocusRef.current();
            return;
        }

        if (nextCount === 0) {
            setValidationError(
                t('side_panel.comments_section.edit.errors.empty')
            );
            setSubmitError(null);
            onRequestFocusRef.current();
            return;
        }

        const submissionSession: EditSession = { ...sessionRef.current };
        const commentId = submissionSession.commentId;

        updateInFlightRef.current = true;
        setIsSubmitting(true);
        setValidationError(null);
        setSubmitError(null);

        const isCurrentSession = () =>
            isMountedRef.current &&
            sessionsEqual(sessionRef.current, submissionSession);

        try {
            await updateComment(commentId, { body: nextTrimmedBody });

            if (!isCurrentSession()) {
                return;
            }

            setShowRemoteWarning(false);
            onSavedRef.current();
        } catch {
            if (!isCurrentSession()) {
                return;
            }

            setSubmitError(
                t('side_panel.comments_section.edit.errors.update_failed')
            );
            if (latestUpdatedAtRef.current !== baselineUpdatedAtRef.current) {
                setShowRemoteWarning(true);
            }
            onRequestFocusRef.current();
        } finally {
            if (sessionsEqual(sessionRef.current, submissionSession)) {
                updateInFlightRef.current = false;
                if (isMountedRef.current) {
                    setIsSubmitting(false);
                }
            }
        }
    }, [body, t, updateComment]);

    const cancel = useCallback(() => {
        if (updateInFlightRef.current || isSubmitting) {
            return;
        }

        setShowRemoteWarning(false);
        onCancelRef.current();
    }, [isSubmitting]);

    return {
        body,
        isSubmitting,
        showRemoteWarning,
        characterCount,
        isEmpty,
        isTooLong,
        canSave,
        errorMessage,
        maxBodyLength: MAX_BODY_LENGTH,
        setBodyFromInput,
        save,
        cancel,
    };
};
