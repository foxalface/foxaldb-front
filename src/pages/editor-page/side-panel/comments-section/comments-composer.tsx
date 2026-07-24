import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Label } from '@/components/label/label';
import { Textarea } from '@/components/textarea/textarea';
import { useCommentMutations } from '@/hooks/use-comment-mutations';
import type {
    DiagramComment,
    DiagramCommentTarget,
} from '@/lib/comments/comment-types';

// Keep in sync with backend DiagramCommentController validation.
const MAX_BODY_LENGTH = 2000;

/**
 * Count Unicode code points (matches Laravel `max:2000` / mb_strlen),
 * not UTF-16 code units and not grapheme clusters.
 */
const countUnicodeCharacters = (value: string): number =>
    Array.from(value).length;

interface ComposerScope {
    diagramId: string;
    targetType: DiagramCommentTarget['targetType'];
    targetId: string | null;
    generation: number;
}

const scopesEqual = (a: ComposerScope, b: ComposerScope): boolean =>
    a.diagramId === b.diagramId &&
    a.targetType === b.targetType &&
    a.targetId === b.targetId &&
    a.generation === b.generation;

export interface CommentsComposerProps {
    target: DiagramCommentTarget;
    diagramId: string;
    onCommentCreated?: (comment: DiagramComment) => void;
}

export const CommentsComposer: React.FC<CommentsComposerProps> = ({
    target,
    diagramId,
    onCommentCreated,
}) => {
    const { t } = useTranslation();
    const { createComment } = useCommentMutations();

    const [body, setBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const submissionInFlightRef = useRef(false);
    const isMountedRef = useRef(true);
    const scopeRef = useRef<ComposerScope>({
        diagramId,
        targetType: target.targetType,
        targetId: target.targetId,
        generation: 0,
    });

    const formId = useId();
    const textareaId = `${formId}-body`;
    const errorId = `${formId}-error`;
    const counterId = `${formId}-counter`;

    const focusTextarea = useCallback(() => {
        textareaRef.current?.focus();
    }, []);

    const clearDraftAndErrors = useCallback(() => {
        setBody('');
        setValidationError(null);
        setSubmitError(null);
    }, []);

    const resetComposer = useCallback(() => {
        clearDraftAndErrors();
        // Scope switch abandons the previous scope's UI lock so the new
        // scope can accept input immediately. In-flight HTTP may still
        // resolve; scope tokens prevent it from mutating the new draft.
        submissionInFlightRef.current = false;
        setIsSubmitting(false);
    }, [clearDraftAndErrors]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        scopeRef.current = {
            diagramId,
            targetType: target.targetType,
            targetId: target.targetId,
            generation: scopeRef.current.generation + 1,
        };
        resetComposer();
    }, [diagramId, target.targetType, target.targetId, resetComposer]);

    const trimmedBody = body.trim();
    const bodyCharacterCount = countUnicodeCharacters(trimmedBody);
    const isEmpty = bodyCharacterCount === 0;
    const isTooLong = bodyCharacterCount > MAX_BODY_LENGTH;
    const canSubmit = !isEmpty && !isTooLong && !isSubmitting;
    const errorMessage = validationError ?? submitError;
    const describedBy = [errorMessage ? errorId : null, counterId]
        .filter((id): id is string => id !== null)
        .join(' ');

    const handleBodyChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const next = event.target.value;
        setBody(next);
        setSubmitError(null);
        const nextCount = countUnicodeCharacters(next.trim());
        if (nextCount > MAX_BODY_LENGTH) {
            setValidationError(
                t('side_panel.comments_section.composer.errors.too_long')
            );
        } else {
            setValidationError(null);
        }
    };

    const submit = useCallback(async () => {
        if (submissionInFlightRef.current) {
            return;
        }

        const nextTrimmedBody = body.trim();
        const nextCount = countUnicodeCharacters(nextTrimmedBody);

        if (nextCount > MAX_BODY_LENGTH) {
            setValidationError(
                t('side_panel.comments_section.composer.errors.too_long')
            );
            setSubmitError(null);
            focusTextarea();
            return;
        }

        if (nextCount === 0) {
            setValidationError(
                t('side_panel.comments_section.composer.errors.empty')
            );
            setSubmitError(null);
            focusTextarea();
            return;
        }

        const submissionScope: ComposerScope = { ...scopeRef.current };

        submissionInFlightRef.current = true;
        setIsSubmitting(true);
        setValidationError(null);
        setSubmitError(null);

        const isCurrentScope = () =>
            isMountedRef.current &&
            scopesEqual(scopeRef.current, submissionScope);

        try {
            const created = await createComment({
                ...target,
                body: nextTrimmedBody,
            });

            if (!isCurrentScope()) {
                return;
            }

            clearDraftAndErrors();
            onCommentCreated?.(created);
            focusTextarea();
        } catch {
            if (!isCurrentScope()) {
                return;
            }

            setSubmitError(
                t('side_panel.comments_section.composer.errors.create_failed')
            );
            focusTextarea();
        } finally {
            if (scopesEqual(scopeRef.current, submissionScope)) {
                submissionInFlightRef.current = false;
                if (isMountedRef.current) {
                    setIsSubmitting(false);
                }
            }
            // Stale completion: leave the new scope's lock, draft, and errors alone.
        }
    }, [
        body,
        clearDraftAndErrors,
        createComment,
        focusTextarea,
        onCommentCreated,
        t,
        target,
    ]);

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void submit();
    };

    const handleCancel = () => {
        if (submissionInFlightRef.current || isSubmitting) {
            return;
        }

        clearDraftAndErrors();
        focusTextarea();
    };

    const handleComposerKeyDown = (
        event: React.KeyboardEvent<HTMLFormElement>
    ) => {
        if (event.key !== 'Escape') {
            return;
        }

        // Ignore Escape while submitting to avoid mid-flight clearing.
        if (submissionInFlightRef.current || isSubmitting) {
            return;
        }

        clearDraftAndErrors();
        focusTextarea();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Escape') {
            // Ignore Escape while submitting to avoid mid-flight clearing.
            if (submissionInFlightRef.current || isSubmitting) {
                return;
            }

            clearDraftAndErrors();
            focusTextarea();
            return;
        }

        if (event.key !== 'Enter' || event.shiftKey) {
            return;
        }

        if (event.nativeEvent.isComposing) {
            return;
        }

        if (submissionInFlightRef.current || isSubmitting) {
            return;
        }

        if (isEmpty || isTooLong) {
            return;
        }

        event.preventDefault();
        void submit();
    };

    return (
        <form
            className="shrink-0 border-t border-border px-0 py-2"
            aria-label={t(
                'side_panel.comments_section.composer.form_aria_label'
            )}
            data-vaul-no-drag
            onSubmit={handleFormSubmit}
            onKeyDown={handleComposerKeyDown}
        >
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={textareaId} className="text-xs">
                    {t('side_panel.comments_section.composer.label')}
                </Label>
                <Textarea
                    ref={textareaRef}
                    id={textareaId}
                    value={body}
                    onChange={handleBodyChange}
                    onKeyDown={handleKeyDown}
                    placeholder={t(
                        'side_panel.comments_section.composer.placeholder'
                    )}
                    readOnly={isSubmitting}
                    aria-invalid={errorMessage !== null}
                    aria-describedby={describedBy}
                    rows={3}
                    className="min-h-[72px] resize-none text-sm"
                />
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        {errorMessage ? (
                            <p
                                id={errorId}
                                role="alert"
                                className="text-xs text-destructive"
                            >
                                {errorMessage}
                            </p>
                        ) : null}
                    </div>
                    <p
                        id={counterId}
                        className="shrink-0 text-xs text-muted-foreground"
                        aria-label={t(
                            'side_panel.comments_section.composer.counter_aria_label',
                            {
                                count: bodyCharacterCount,
                                max: MAX_BODY_LENGTH,
                            }
                        )}
                    >
                        {bodyCharacterCount} / {MAX_BODY_LENGTH}
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={isSubmitting}
                        onClick={handleCancel}
                    >
                        {t('side_panel.comments_section.composer.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={!canSubmit}
                    >
                        {isSubmitting
                            ? t(
                                  'side_panel.comments_section.composer.submitting'
                              )
                            : t('side_panel.comments_section.composer.submit')}
                    </Button>
                </div>
            </div>
        </form>
    );
};
