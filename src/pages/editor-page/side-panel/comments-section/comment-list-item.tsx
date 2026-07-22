import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { getCommentCapabilities } from '@/lib/comments/comment-capabilities';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { CommentActionsMenu } from './comment-actions-menu';
import { CommentAuthor } from './comment-author';
import { CommentEditForm } from './comment-edit-form';
import { CommentTargetContext } from './comment-target-context';

export interface CommentListItemProps {
    comment: DiagramComment;
}

export const CommentListItem: React.FC<CommentListItemProps> = ({
    comment,
}) => {
    const { user } = useAuth();
    const { diagramAccess } = useDiagramAccess();
    const [isEditing, setIsEditing] = useState(false);
    const actionsTriggerRef = useRef<HTMLButtonElement>(null);
    const shouldFocusActionsRef = useRef(false);

    const capabilities = getCommentCapabilities({
        comment,
        currentUserId: user?.id,
        diagramAccess,
    });

    const exitEditing = useCallback((restoreFocus: boolean) => {
        setIsEditing(false);
        if (restoreFocus) {
            shouldFocusActionsRef.current = true;
        }
    }, []);

    useEffect(() => {
        if (isEditing && !capabilities.canEdit) {
            exitEditing(false);
        }
    }, [capabilities.canEdit, exitEditing, isEditing]);

    useLayoutEffect(() => {
        if (isEditing || !shouldFocusActionsRef.current) {
            return;
        }

        shouldFocusActionsRef.current = false;
        actionsTriggerRef.current?.focus();
    }, [isEditing]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        exitEditing(true);
    };

    const handleSaved = () => {
        exitEditing(true);
    };

    return (
        <article className="flex flex-col gap-1.5 px-1 py-3">
            <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <CommentAuthor
                        user={comment.user}
                        createdAt={comment.createdAt}
                    />
                </div>
                {!isEditing ? (
                    <CommentActionsMenu
                        ref={actionsTriggerRef}
                        canEdit={capabilities.canEdit}
                        onEdit={handleEdit}
                    />
                ) : null}
            </div>
            {isEditing ? (
                <CommentEditForm
                    comment={comment}
                    diagramId={String(comment.diagramId)}
                    onCancel={handleCancel}
                    onSaved={handleSaved}
                />
            ) : (
                <p className="whitespace-pre-wrap break-words text-sm text-foreground [overflow-wrap:anywhere]">
                    {comment.body}
                </p>
            )}
            <CommentTargetContext targetType={comment.targetType} />
        </article>
    );
};
