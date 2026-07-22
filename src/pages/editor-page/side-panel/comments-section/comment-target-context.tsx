import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CommentTargetType } from '@/lib/comments/comment-types';

export interface CommentTargetContextProps {
    targetType: CommentTargetType | string;
}

const TARGET_KEY_BY_TYPE: Record<CommentTargetType, string> = {
    diagram: 'side_panel.comments_section.targets.diagram',
    table: 'side_panel.comments_section.targets.table',
    field: 'side_panel.comments_section.targets.field',
    relationship: 'side_panel.comments_section.targets.relationship',
};

export const CommentTargetContext: React.FC<CommentTargetContextProps> = ({
    targetType,
}) => {
    const { t } = useTranslation();

    const labelKey =
        targetType in TARGET_KEY_BY_TYPE
            ? TARGET_KEY_BY_TYPE[targetType as CommentTargetType]
            : 'side_panel.comments_section.targets.unknown';

    return <p className="text-xs text-muted-foreground">{t(labelKey)}</p>;
};
