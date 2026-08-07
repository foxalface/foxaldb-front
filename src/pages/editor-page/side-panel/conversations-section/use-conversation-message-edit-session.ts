import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConversationMutations } from '@/hooks/use-conversation-mutations';
import {
    CONVERSATION_MESSAGE_MAX_LENGTH,
    countUnicodeCharacters,
    normalizeConversationMessageBody,
} from '@/lib/conversations/conversation-message-body';
import type {
    ConversationStatus,
    DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';
import { resolveConversationMessageMutationError } from '@/lib/conversations/format-conversation-message-mutation-error';

interface EditSession {
    messageId: number;
    conversationId: number;
    generation: number;
}

const sessionsEqual = (a: EditSession, b: EditSession): boolean =>
    a.messageId === b.messageId &&
    a.conversationId === b.conversationId &&
    a.generation === b.generation;

export interface UseConversationMessageEditSessionArgs {
    message: DiagramConversationMessage;
    conversationId: number;
    conversationStatus: ConversationStatus;
    onCancel: () => void;
    onSaved: () => void;
    onRequestFocus: () => void;
}

export interface UseConversationMessageEditSessionResult {
    body: string;
    isSubmitting: boolean;
    characterCount: number;
    canSave: boolean;
    errorMessage: string | null;
    maxBodyLength: number;
    setBodyFromInput: (value: string) => void;
    save: () => Promise<void>;
    cancel: () => void;
}

export const useConversationMessageEditSession = ({
    message,
    conversationId,
    conversationStatus,
    onCancel,
    onSaved,
    onRequestFocus,
}: UseConversationMessageEditSessionArgs): UseConversationMessageEditSessionResult => {
    const { t } = useTranslation();
    const { updateMessage } = useConversationMutations();

    const [body, setBody] = useState(() => message.body);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const bodyRef = useRef(body);
    bodyRef.current = body;

    const updateInFlightRef = useRef(false);
    const isMountedRef = useRef(true);
    const sessionRef = useRef<EditSession>({
        messageId: message.id,
        conversationId,
        generation: 0,
    });
    const onCancelRef = useRef(onCancel);
    const onSavedRef = useRef(onSaved);
    const onRequestFocusRef = useRef(onRequestFocus);

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
        sessionRef.current = {
            messageId: message.id,
            conversationId,
            generation: sessionRef.current.generation + 1,
        };
        updateInFlightRef.current = false;
        setIsSubmitting(false);
        setValidationError(null);
        setSubmitError(null);
    }, [conversationId, message.id]);

    useEffect(() => {
        if (updateInFlightRef.current) {
            return;
        }

        setBody(message.body);
        bodyRef.current = message.body;
    }, [message.body]);

    const trimmedBody = normalizeConversationMessageBody(body);
    const characterCount = countUnicodeCharacters(trimmedBody);
    const isEmpty = characterCount === 0;
    const isTooLong = characterCount > CONVERSATION_MESSAGE_MAX_LENGTH;
    const canSave =
        conversationStatus === 'active' &&
        !isEmpty &&
        !isTooLong &&
        !isSubmitting;
    const errorMessage = validationError ?? submitError;

    const resolveSubmitErrorMessage = useCallback(
        (error: unknown): string => {
            const resolved = resolveConversationMessageMutationError(error);

            if (resolved.key === 'validation') {
                return (
                    resolved.fieldError ??
                    t(
                        'side_panel.conversations_section.detail.edit.errors.empty'
                    )
                );
            }

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
                'side_panel.conversations_section.detail.edit.errors.update_failed'
            );
        },
        [t]
    );

    const setBodyFromInput = useCallback(
        (value: string) => {
            setBody(value);
            setSubmitError(null);
            const nextCount = countUnicodeCharacters(
                normalizeConversationMessageBody(value)
            );
            if (nextCount > CONVERSATION_MESSAGE_MAX_LENGTH) {
                setValidationError(
                    t(
                        'side_panel.conversations_section.detail.edit.errors.too_long'
                    )
                );
            } else {
                setValidationError(null);
            }
        },
        [t]
    );

    const save = useCallback(async () => {
        if (updateInFlightRef.current || conversationStatus !== 'active') {
            return;
        }

        const nextTrimmedBody = normalizeConversationMessageBody(
            bodyRef.current
        );
        const nextCount = countUnicodeCharacters(nextTrimmedBody);

        if (nextCount > CONVERSATION_MESSAGE_MAX_LENGTH) {
            setValidationError(
                t(
                    'side_panel.conversations_section.detail.edit.errors.too_long'
                )
            );
            setSubmitError(null);
            onRequestFocusRef.current();
            return;
        }

        if (nextCount === 0) {
            setValidationError(
                t('side_panel.conversations_section.detail.edit.errors.empty')
            );
            setSubmitError(null);
            onRequestFocusRef.current();
            return;
        }

        const submissionSession: EditSession = { ...sessionRef.current };
        const messageId = submissionSession.messageId;

        updateInFlightRef.current = true;
        setIsSubmitting(true);
        setValidationError(null);
        setSubmitError(null);

        const isCurrentSession = () =>
            isMountedRef.current &&
            sessionsEqual(sessionRef.current, submissionSession);

        try {
            await updateMessage(submissionSession.conversationId, messageId, {
                body: nextTrimmedBody,
            });

            if (
                !isMountedRef.current ||
                sessionRef.current.messageId !== messageId
            ) {
                return;
            }

            onSavedRef.current();
        } catch (error) {
            if (!isCurrentSession()) {
                return;
            }

            setSubmitError(resolveSubmitErrorMessage(error));
            onRequestFocusRef.current();
        } finally {
            if (sessionsEqual(sessionRef.current, submissionSession)) {
                updateInFlightRef.current = false;
                if (isMountedRef.current) {
                    setIsSubmitting(false);
                }
            }
        }
    }, [conversationStatus, resolveSubmitErrorMessage, t, updateMessage]);

    const cancel = useCallback(() => {
        if (updateInFlightRef.current || isSubmitting) {
            return;
        }

        onCancelRef.current();
    }, [isSubmitting]);

    return {
        body,
        isSubmitting,
        characterCount,
        canSave,
        errorMessage,
        maxBodyLength: CONVERSATION_MESSAGE_MAX_LENGTH,
        setBodyFromInput,
        save,
        cancel,
    };
};
