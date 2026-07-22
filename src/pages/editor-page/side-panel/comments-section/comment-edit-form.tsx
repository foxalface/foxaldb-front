import React, { useCallback, useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Label } from '@/components/label/label';
import { Textarea } from '@/components/textarea/textarea';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { useCommentEditSession } from './use-comment-edit-session';

export interface CommentEditFormProps {
    comment: DiagramComment;
    diagramId: string;
    onCancel: () => void;
    onSaved: () => void;
}

export const CommentEditForm: React.FC<CommentEditFormProps> = ({
    comment,
    diagramId,
    onCancel,
    onSaved,
}) => {
    const { t } = useTranslation();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const focusTextarea = useCallback(() => {
        textareaRef.current?.focus();
    }, []);

    const session = useCommentEditSession({
        comment,
        diagramId,
        onCancel,
        onSaved,
        onRequestFocus: focusTextarea,
    });

    const formId = useId();
    const textareaId = `${formId}-body`;
    const errorId = `${formId}-error`;
    const counterId = `${formId}-counter`;
    const warningId = `${formId}-warning`;

    useEffect(() => {
        focusTextarea();
    }, [focusTextarea]);

    const describedBy = [
        session.errorMessage ? errorId : null,
        counterId,
        session.showRemoteWarning ? warningId : null,
    ]
        .filter((id): id is string => id !== null)
        .join(' ');

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
        if (event.key !== 'Escape') {
            return;
        }

        session.cancel();
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

        if (session.isSubmitting || session.isEmpty || session.isTooLong) {
            return;
        }

        event.preventDefault();
        void session.save();
    };

    return (
        <form
            className="flex flex-col gap-1.5"
            aria-label={t('side_panel.comments_section.edit.form_aria_label')}
            data-vaul-no-drag
            onSubmit={handleFormSubmit}
            onKeyDown={handleFormKeyDown}
        >
            <Label htmlFor={textareaId} className="text-xs">
                {t('side_panel.comments_section.edit.label')}
            </Label>
            <Textarea
                ref={textareaRef}
                id={textareaId}
                value={session.body}
                onChange={handleBodyChange}
                onKeyDown={handleKeyDown}
                readOnly={session.isSubmitting}
                aria-invalid={session.errorMessage !== null}
                aria-describedby={describedBy}
                rows={3}
                className="min-h-[72px] w-full max-w-full resize-none text-sm"
            />
            {session.showRemoteWarning ? (
                <p
                    id={warningId}
                    role="status"
                    className="text-xs text-muted-foreground"
                >
                    {t(
                        'side_panel.comments_section.edit.remote_updated_warning'
                    )}
                </p>
            ) : null}
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
                    ) : null}
                </div>
                <p
                    id={counterId}
                    className="shrink-0 text-xs text-muted-foreground"
                    aria-label={t(
                        'side_panel.comments_section.edit.counter_aria_label',
                        {
                            count: session.characterCount,
                            max: session.maxBodyLength,
                        }
                    )}
                >
                    {session.characterCount} / {session.maxBodyLength}
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={session.isSubmitting}
                    onClick={session.cancel}
                >
                    {t('side_panel.comments_section.edit.cancel')}
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={!session.canSave}
                >
                    {session.isSubmitting
                        ? t('side_panel.comments_section.edit.saving')
                        : t('side_panel.comments_section.edit.save')}
                </Button>
            </div>
        </form>
    );
};
