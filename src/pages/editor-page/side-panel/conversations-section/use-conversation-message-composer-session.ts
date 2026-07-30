import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConversationMutations } from '@/hooks/use-conversation-mutations';
import {
    CONVERSATION_MESSAGE_MAX_LENGTH,
    countUnicodeCharacters,
    normalizeConversationMessageBody,
} from '@/lib/conversations/conversation-message-body';
import type { ConversationStatus } from '@/lib/conversations/conversation-types';
import { resolveConversationMessageMutationError } from '@/lib/conversations/format-conversation-message-mutation-error';

interface ComposerSession {
    conversationId: number;
    generation: number;
}

const sessionsEqual = (a: ComposerSession, b: ComposerSession): boolean =>
    a.conversationId === b.conversationId && a.generation === b.generation;

export interface UseConversationMessageComposerSessionArgs {
    conversationId: number;
    conversationStatus: ConversationStatus;
    canCreate: boolean;
}

export interface UseConversationMessageComposerSessionResult {
    body: string;
    isSubmitting: boolean;
    characterCount: number;
    canSubmit: boolean;
    errorMessage: string | null;
    maxBodyLength: number;
    setBodyFromInput: (value: string) => void;
    submit: () => Promise<void>;
    clearDraft: () => void;
}

export const useConversationMessageComposerSession = ({
    conversationId,
    conversationStatus,
    canCreate,
}: UseConversationMessageComposerSessionArgs): UseConversationMessageComposerSessionResult => {
    const { t } = useTranslation();
    const { createMessage } = useConversationMutations();

    const [body, setBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const submissionInFlightRef = useRef(false);
    const isMountedRef = useRef(true);
    const sessionRef = useRef<ComposerSession>({
        conversationId,
        generation: 0,
    });

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
        submissionInFlightRef.current = false;
        setBody('');
        setIsSubmitting(false);
        setValidationError(null);
        setSubmitError(null);
    }, [conversationId]);

    const trimmedBody = normalizeConversationMessageBody(body);
    const characterCount = countUnicodeCharacters(trimmedBody);
    const isEmpty = characterCount === 0;
    const isTooLong = characterCount > CONVERSATION_MESSAGE_MAX_LENGTH;
    const canSubmit =
        canCreate &&
        conversationStatus === 'active' &&
        !isEmpty &&
        !isTooLong &&
        !isSubmitting;
    const errorMessage = validationError ?? submitError;

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
                        'side_panel.conversations_section.detail.composer.errors.too_long'
                    )
                );
            } else {
                setValidationError(null);
            }
        },
        [t]
    );

    const clearDraft = useCallback(() => {
        setBody('');
        setValidationError(null);
        setSubmitError(null);
    }, []);

    const resolveSubmitErrorMessage = useCallback(
        (error: unknown): string => {
            const resolved = resolveConversationMessageMutationError(error);

            if (resolved.key === 'validation') {
                return (
                    resolved.fieldError ??
                    t(
                        'side_panel.conversations_section.detail.composer.errors.empty'
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
                'side_panel.conversations_section.detail.composer.errors.create_failed'
            );
        },
        [t]
    );

    const submit = useCallback(async () => {
        if (
            submissionInFlightRef.current ||
            !canCreate ||
            conversationStatus !== 'active'
        ) {
            return;
        }

        const nextTrimmedBody = normalizeConversationMessageBody(body);
        const nextCount = countUnicodeCharacters(nextTrimmedBody);

        if (nextCount > CONVERSATION_MESSAGE_MAX_LENGTH) {
            setValidationError(
                t(
                    'side_panel.conversations_section.detail.composer.errors.too_long'
                )
            );
            setSubmitError(null);
            return;
        }

        if (nextCount === 0) {
            setValidationError(
                t(
                    'side_panel.conversations_section.detail.composer.errors.empty'
                )
            );
            setSubmitError(null);
            return;
        }

        const submissionSession: ComposerSession = { ...sessionRef.current };

        submissionInFlightRef.current = true;
        setIsSubmitting(true);
        setValidationError(null);
        setSubmitError(null);

        const isCurrentSession = () =>
            isMountedRef.current &&
            sessionsEqual(sessionRef.current, submissionSession);

        try {
            await createMessage(submissionSession.conversationId, {
                body: nextTrimmedBody,
            });

            if (!isCurrentSession()) {
                return;
            }

            setBody('');
            setValidationError(null);
            setSubmitError(null);
        } catch (error) {
            if (!isCurrentSession()) {
                return;
            }

            setSubmitError(resolveSubmitErrorMessage(error));
        } finally {
            if (sessionsEqual(sessionRef.current, submissionSession)) {
                submissionInFlightRef.current = false;
                if (isMountedRef.current) {
                    setIsSubmitting(false);
                }
            }
        }
    }, [
        body,
        canCreate,
        conversationStatus,
        createMessage,
        resolveSubmitErrorMessage,
        t,
    ]);

    return {
        body,
        isSubmitting,
        characterCount,
        canSubmit,
        errorMessage,
        maxBodyLength: CONVERSATION_MESSAGE_MAX_LENGTH,
        setBodyFromInput,
        submit,
        clearDraft,
    };
};
