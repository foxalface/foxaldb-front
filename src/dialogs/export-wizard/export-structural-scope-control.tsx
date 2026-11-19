import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs/tabs';
import type { DiagramTag, TagMatchMode } from '@/lib/domain/diagram-tag';
import {
    fullStructuralExportScope,
    type StructuralExportScope,
} from '@/lib/domain/structural-export-scope';

interface ExportStructuralScopeControlProps {
    tags: readonly DiagramTag[];
    scope: StructuralExportScope;
    onChange: (scope: StructuralExportScope) => void;
}

const MATCH_MODES: readonly TagMatchMode[] = ['any', 'all', 'none'];

export const ExportStructuralScopeControl: React.FC<
    ExportStructuralScopeControlProps
> = ({ tags, scope, onChange }) => {
    const { t } = useTranslation();
    const isTags = scope.kind === 'tags';
    const selectedTagIds = isTags ? scope.selectedTagIds : [];
    const matchMode: TagMatchMode = isTags ? scope.matchMode : 'any';

    const handleKindChange = useCallback(
        (value: string) => {
            if (value === 'all') {
                onChange(fullStructuralExportScope);
                return;
            }

            if (value !== 'tags' || scope.kind === 'tags') {
                return;
            }

            onChange({
                kind: 'tags',
                selectedTagIds: [],
                matchMode: 'any',
            });
        },
        [onChange, scope.kind]
    );

    const handleMatchModeChange = useCallback(
        (value: string) => {
            if (scope.kind !== 'tags') {
                return;
            }

            if (value !== 'any' && value !== 'all' && value !== 'none') {
                return;
            }

            onChange({
                kind: 'tags',
                selectedTagIds: scope.selectedTagIds,
                matchMode: value,
            });
        },
        [onChange, scope]
    );

    const handleToggleTag = useCallback(
        (tagId: string, checked: boolean) => {
            if (scope.kind !== 'tags') {
                return;
            }

            const selectedTagIds = checked
                ? [...scope.selectedTagIds, tagId]
                : scope.selectedTagIds.filter(
                      (selectedId) => selectedId !== tagId
                  );

            onChange({
                kind: 'tags',
                selectedTagIds,
                matchMode: scope.matchMode,
            });
        },
        [onChange, scope]
    );

    const handleClear = useCallback(() => {
        if (scope.kind !== 'tags' || scope.selectedTagIds.length === 0) {
            return;
        }

        onChange({
            kind: 'tags',
            selectedTagIds: [],
            matchMode: scope.matchMode,
        });
    }, [onChange, scope]);

    return (
        <div
            className="flex flex-col gap-3"
            data-testid="export-structural-scope"
        >
            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                    {t('export_wizard.scope.label')}
                </p>
                <Tabs value={scope.kind} onValueChange={handleKindChange}>
                    <TabsList aria-label={t('export_wizard.scope.label')}>
                        <TabsTrigger
                            value="all"
                            data-testid="export-structural-scope-all"
                        >
                            {t('export_wizard.scope.all')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="tags"
                            data-testid="export-structural-scope-tags"
                        >
                            {t('export_wizard.scope.tags')}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <p className="text-xs text-muted-foreground">
                    {t('export_wizard.scope.hint')}
                </p>
            </div>

            {isTags ? (
                tags.length === 0 ? (
                    <p
                        className="text-sm text-muted-foreground"
                        data-testid="export-structural-scope-no-tags"
                    >
                        {t('side_panel.filters_section.empty')}
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Tabs
                                value={matchMode}
                                onValueChange={handleMatchModeChange}
                            >
                                <TabsList
                                    aria-label={t(
                                        'side_panel.filters_section.match_label'
                                    )}
                                >
                                    {MATCH_MODES.map((mode) => (
                                        <TabsTrigger
                                            key={mode}
                                            value={mode}
                                            data-testid={`export-structural-scope-match-${mode}`}
                                        >
                                            {t(
                                                `side_panel.filters_section.match.${mode}`
                                            )}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                disabled={selectedTagIds.length === 0}
                                data-testid="export-structural-scope-clear"
                            >
                                {t('side_panel.filters_section.clear')}
                            </Button>
                        </div>
                        <p
                            className="text-xs text-muted-foreground"
                            data-testid="export-structural-scope-summary"
                        >
                            {selectedTagIds.length === 0
                                ? t(
                                      'side_panel.filters_section.summary.no_constraint'
                                  )
                                : t(
                                      'side_panel.filters_section.summary.selected',
                                      { count: selectedTagIds.length }
                                  )}
                        </p>
                        <ul className="flex max-h-32 flex-col gap-1 overflow-y-auto">
                            {tags.map((tag) => {
                                const checked = selectedTagIds.includes(tag.id);

                                return (
                                    <li key={tag.id}>
                                        <label className="flex items-center gap-2 rounded-md p-1 text-sm hover:bg-accent">
                                            <Checkbox
                                                checked={checked}
                                                aria-label={tag.name}
                                                data-testid={`export-structural-scope-tag-${tag.id}`}
                                                onCheckedChange={(value) =>
                                                    handleToggleTag(
                                                        tag.id,
                                                        value === true
                                                    )
                                                }
                                            />
                                            <span
                                                className="size-2.5 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor: tag.color,
                                                }}
                                                aria-hidden
                                            />
                                            <span className="truncate">
                                                {tag.name}
                                            </span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )
            ) : null}
        </div>
    );
};
