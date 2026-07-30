import React, { useCallback, useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Label } from '@/components/label/label';
import { Textarea } from '@/components/textarea/textarea';
import type { ConversationStatus } from '@/lib/conversations/conversation-types';
import { useConversationMessageComposerSession } from './use-conversation-message-composer-session';

export interface ConversationMessageComposerProps {
    conversationId: number;
    conversationStatus: ConversationStatus;
    canCreate: boolean;
}

export const ConversationMessageComposer: React.FC<
    ConversationMessageComposerProps
> = ({ conversationId, conversationStatus, canCreate }) => {
    const { t } = useTranslation();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const session = useConversationMessageComposerSession({
        conversationId,
        conversationStatus,
        canCreate,
    });

    const formId = useId();
    const textareaId = `${formId}-body`;
    const errorId = `${formId}-error`;
    const counterId = `${formId}-counter`;
    const hintId = `${formId}-hint`;

    const focusTextarea = useCallback(() => {
        textareaRef.current?.focus();
    }, []);

    const describedBy = [
        session.errorMessage ? errorId : hintId,
        counterId,
    ].join(' ');

    const handleBodyChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        session.setBodyFromInput(event.target.value);
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void session.submit();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key !== 'Enter' || event.shiftKey) {
            return;
        }

        if (event.nativeEvent.isComposing) {
            return;
        }

        if (session.isSubmitting || !session.canSubmit) {
            return;
        }

        event.preventDefault();
        void session.submit();
    };

    useEffect(() => {
        if (canCreate && conversationStatus === 'active') {
            focusTextarea();
        }
    }, [canCreate, conversationId, conversationStatus, focusTextarea]);

    if (!canCreate || conversationStatus !== 'active') {
        return null;
    }

    return (
        <form
            className="shrink-0 border-t border-border px-1 py-2"
            aria-label={t(
                'side_panel.conversations_section.detail.composer.form_aria_label'
            )}
            data-testid="conversation-message-composer"
            data-vaul-no-drag
            onSubmit={handleFormSubmit}
        >
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={textareaId} className="text-xs">
                    {t(
                        'side_panel.conversations_section.detail.composer.label'
                    )}
                </Label>
                <Textarea
                    ref={textareaRef}
                    id={textareaId}
                    value={session.body}
                    onChange={handleBodyChange}
                    onKeyDown={handleKeyDown}
                    placeholder={t(
                        'side_panel.conversations_section.detail.composer.placeholder'
                    )}
                    readOnly={session.isSubmitting}
                    aria-invalid={session.errorMessage !== null}
                    aria-describedby={describedBy}
                    rows={3}
                    className="min-h-[72px] resize-none text-sm"
                />
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        {session.errorMessage ? (
                            <p
                                id={errorId}
                                role="alert"
                                className="text-xs text-destructive"
                            >
                                {session.errorMessage}
                            </p>
                        ) : (
                            <p
                                id={hintId}
                                className="text-xs text-muted-foreground"
                            >
                                {t(
                                    'side_panel.conversations_section.detail.composer.keyboard_hint'
                                )}
                            </p>
                        )}
                    </div>
                    <p
                        id={counterId}
                        className="shrink-0 text-xs text-muted-foreground"
                        aria-label={t(
                            'side_panel.conversations_section.detail.composer.counter_aria_label',
                            {
                                count: session.characterCount,
                                max: session.maxBodyLength,
                            }
                        )}
                    >
                        {session.characterCount} / {session.maxBodyLength}
                    </p>
                </div>
                <div className="flex items-center justify-end">
                    <Button
                        type="submit"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={!session.canSubmit}
                        aria-busy={session.isSubmitting}
                    >
                        {session.isSubmitting
                            ? t(
                                  'side_panel.conversations_section.detail.composer.submitting'
                              )
                            : t(
                                  'side_panel.conversations_section.detail.composer.submit'
                              )}
                    </Button>
                </div>
            </div>
        </form>
    );
};
