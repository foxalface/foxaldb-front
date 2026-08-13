import React, { useCallback, useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Textarea } from '@/components/textarea/textarea';
import type {
    ConversationStatus,
    DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';
import { useConversationMessageComposerSession } from './use-conversation-message-composer-session';
import { useConversationMessageEditSession } from './use-conversation-message-edit-session';

export interface ConversationMessageComposerProps {
    conversationId: number;
    conversationStatus: ConversationStatus;
    canCreate: boolean;
    editingMessage: DiagramConversationMessage | null;
    onCancelEdit: () => void;
    onEditSaved: () => void;
}

interface ConversationMessageComposerCreateProps {
    conversationId: number;
    conversationStatus: ConversationStatus;
    canCreate: boolean;
}

const ConversationMessageComposerCreate: React.FC<
    ConversationMessageComposerCreateProps
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

    const focusTextarea = useCallback(() => {
        textareaRef.current?.focus();
    }, []);

    const describedBy = session.errorMessage
        ? `${errorId} ${counterId}`
        : counterId;

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

    return (
        <form
            className="shrink-0 border-t border-border px-1.5 py-2"
            aria-label={t(
                'side_panel.conversations_section.detail.composer.form_aria_label'
            )}
            data-testid="conversation-message-composer"
            data-vaul-no-drag
            onSubmit={handleFormSubmit}
        >
            <div className="flex flex-col gap-1.5">
                <Textarea
                    ref={textareaRef}
                    id={textareaId}
                    value={session.body}
                    onChange={handleBodyChange}
                    onKeyDown={handleKeyDown}
                    placeholder={t(
                        'side_panel.conversations_section.detail.composer.placeholder'
                    )}
                    aria-label={t(
                        'side_panel.conversations_section.detail.composer.label'
                    )}
                    readOnly={session.isSubmitting}
                    aria-invalid={session.errorMessage !== null}
                    aria-describedby={describedBy}
                    rows={3}
                    className="min-h-[72px] resize-none text-sm"
                />
                {session.errorMessage ? (
                    <p
                        id={errorId}
                        role="alert"
                        className="text-xs text-destructive"
                    >
                        {session.errorMessage}
                    </p>
                ) : null}
                <div className="flex items-center justify-between gap-2">
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

interface ConversationMessageComposerEditProps {
    message: DiagramConversationMessage;
    conversationStatus: ConversationStatus;
    onCancelEdit: () => void;
    onEditSaved: () => void;
}

const ConversationMessageComposerEdit: React.FC<
    ConversationMessageComposerEditProps
> = ({ message, conversationStatus, onCancelEdit, onEditSaved }) => {
    const { t } = useTranslation();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const focusTextarea = useCallback(() => {
        textareaRef.current?.focus();
    }, []);

    const session = useConversationMessageEditSession({
        message,
        conversationId: message.conversationId,
        conversationStatus,
        onCancel: onCancelEdit,
        onSaved: onEditSaved,
        onRequestFocus: focusTextarea,
    });

    const formId = useId();
    const textareaId = `${formId}-body`;
    const errorId = `${formId}-error`;
    const counterId = `${formId}-counter`;

    useEffect(() => {
        focusTextarea();
    }, [focusTextarea, message.id]);

    const describedBy = session.errorMessage
        ? `${errorId} ${counterId}`
        : counterId;

    const handleBodyChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        session.setBodyFromInput(event.target.value);
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void session.save();
    };

    const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
        if (event.key === 'Escape') {
            session.cancel();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            session.cancel();
            return;
        }

        if (event.key !== 'Enter' || event.shiftKey) {
            return;
        }

        if (event.nativeEvent.isComposing) {
            return;
        }

        if (session.isSubmitting || !session.canSave) {
            return;
        }

        event.preventDefault();
        void session.save();
    };

    return (
        <form
            className="shrink-0 border-t border-border px-1.5 py-2"
            aria-label={t(
                'side_panel.conversations_section.detail.edit.form_aria_label'
            )}
            data-testid={`conversation-message-edit-form-${message.id}`}
            data-vaul-no-drag
            onSubmit={handleFormSubmit}
            onKeyDown={handleFormKeyDown}
        >
            <div className="flex flex-col gap-1.5">
                <Textarea
                    ref={textareaRef}
                    id={textareaId}
                    value={session.body}
                    onChange={handleBodyChange}
                    onKeyDown={handleKeyDown}
                    aria-label={t(
                        'side_panel.conversations_section.detail.edit.label'
                    )}
                    readOnly={session.isSubmitting}
                    aria-invalid={session.errorMessage !== null}
                    aria-describedby={describedBy}
                    rows={3}
                    className="min-h-[72px] resize-none text-sm"
                />
                {session.errorMessage ? (
                    <p
                        id={errorId}
                        role="alert"
                        className="text-xs text-destructive"
                    >
                        {session.errorMessage}
                    </p>
                ) : null}
                <div className="flex items-center justify-between gap-2">
                    <p
                        id={counterId}
                        className="shrink-0 text-xs text-muted-foreground"
                        aria-label={t(
                            'side_panel.conversations_section.detail.edit.counter_aria_label',
                            {
                                count: session.characterCount,
                                max: session.maxBodyLength,
                            }
                        )}
                    >
                        {session.characterCount} / {session.maxBodyLength}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            disabled={session.isSubmitting}
                            onClick={session.cancel}
                        >
                            {t(
                                'side_panel.conversations_section.detail.edit.cancel'
                            )}
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            disabled={!session.canSave}
                            aria-busy={session.isSubmitting}
                        >
                            {session.isSubmitting
                                ? t(
                                      'side_panel.conversations_section.detail.edit.saving'
                                  )
                                : t(
                                      'side_panel.conversations_section.detail.edit.save'
                                  )}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export const ConversationMessageComposer: React.FC<
    ConversationMessageComposerProps
> = ({
    conversationId,
    conversationStatus,
    canCreate,
    editingMessage,
    onCancelEdit,
    onEditSaved,
}) => {
    if (conversationStatus !== 'active') {
        return null;
    }

    if (editingMessage) {
        return (
            <ConversationMessageComposerEdit
                message={editingMessage}
                conversationStatus={conversationStatus}
                onCancelEdit={onCancelEdit}
                onEditSaved={onEditSaved}
            />
        );
    }

    if (!canCreate) {
        return null;
    }

    return (
        <ConversationMessageComposerCreate
            conversationId={conversationId}
            conversationStatus={conversationStatus}
            canCreate={canCreate}
        />
    );
};
