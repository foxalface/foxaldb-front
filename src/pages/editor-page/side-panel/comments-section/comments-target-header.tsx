import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import type { DiscussionView } from '@/context/layout-context/layout-context';
import type { ResolvedDiscussionTarget } from '@/lib/comments/resolve-discussion-target';

export interface CommentsTargetHeaderProps {
    view: DiscussionView;
    resolvedTarget: ResolvedDiscussionTarget;
    onShowAll: () => void;
    onShowDiagram: () => void;
}

const formatResolvedTargetLabel = (
    resolvedTarget: ResolvedDiscussionTarget,
    t: (key: string, options?: Record<string, string>) => string
): string => {
    switch (resolvedTarget.kind) {
        case 'diagram':
            return t('side_panel.comments_section.target_header.diagram');
        case 'table':
            return t('side_panel.comments_section.target_header.table', {
                name: resolvedTarget.name,
            });
        case 'field':
            return t('side_panel.comments_section.target_header.field', {
                table: resolvedTarget.tableName,
                field: resolvedTarget.fieldName,
            });
        case 'relationship': {
            if (resolvedTarget.name) {
                return t(
                    'side_panel.comments_section.target_header.relationship',
                    { name: resolvedTarget.name }
                );
            }
            return t(
                'side_panel.comments_section.target_header.relationship_endpoints',
                {
                    source: resolvedTarget.sourceTableName ?? '—',
                    target: resolvedTarget.targetTableName ?? '—',
                }
            );
        }
        case 'missing':
            if (resolvedTarget.targetType === 'table') {
                return t(
                    'side_panel.comments_section.target_header.missing_table'
                );
            }
            if (resolvedTarget.targetType === 'field') {
                return t(
                    'side_panel.comments_section.target_header.missing_field'
                );
            }
            return t(
                'side_panel.comments_section.target_header.missing_relationship'
            );
    }
};

export const CommentsTargetHeader: React.FC<CommentsTargetHeaderProps> = ({
    view,
    resolvedTarget,
    onShowAll,
    onShowDiagram,
}) => {
    const { t } = useTranslation();
    const currentLabel = formatResolvedTargetLabel(resolvedTarget, t);

    return (
        <div
            className="flex flex-col gap-2 py-1"
            data-testid="comments-target-header"
        >
            <div className="flex flex-wrap items-center gap-1.5" role="group">
                <Button
                    type="button"
                    size="sm"
                    variant={view === 'all' ? 'secondary' : 'ghost'}
                    aria-pressed={view === 'all'}
                    aria-label={t('side_panel.comments_section.views.all')}
                    onClick={onShowAll}
                >
                    {t('side_panel.comments_section.views.all')}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={view === 'diagram' ? 'secondary' : 'ghost'}
                    aria-pressed={view === 'diagram'}
                    aria-label={t('side_panel.comments_section.views.diagram')}
                    onClick={onShowDiagram}
                >
                    {t('side_panel.comments_section.views.diagram')}
                </Button>
            </div>
            {view === 'target' ? (
                <p
                    className="min-w-0 break-words text-xs text-muted-foreground"
                    data-testid="comments-current-target"
                >
                    <span className="font-medium text-foreground">
                        {t('side_panel.comments_section.views.current_target')}
                        {': '}
                    </span>
                    {currentLabel}
                </p>
            ) : null}
        </div>
    );
};
