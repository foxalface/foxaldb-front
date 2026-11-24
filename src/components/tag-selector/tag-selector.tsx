import React, { useMemo, useRef, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import { Input } from '@/components/input/input';
import { useChartDB } from '@/hooks/use-chartdb';
import type { DiagramTag, TagTargetType } from '@/lib/domain/diagram-tag';
import { generateId } from '@/lib/utils';

export interface TagSelectorProps {
    targetType: TagTargetType;
    targetId: string;
    disabled?: boolean;
}

const stopMenuEvent = (event: React.SyntheticEvent) => {
    event.stopPropagation();
};

export const TagSelector: React.FC<TagSelectorProps> = ({
    targetType,
    targetId,
    disabled = false,
}) => {
    const { t } = useTranslation();
    const {
        currentDiagram,
        tagAssignments,
        addTags,
        updateTag,
        removeTags,
        addTagAssignments,
        removeTagAssignments,
    } = useChartDB();
    const tags = useMemo(
        () => currentDiagram.tags ?? [],
        [currentDiagram.tags]
    );
    const [search, setSearch] = useState('');
    const [draftName, setDraftName] = useState('');
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const cancelRenameRef = useRef(false);

    const visibleTags = useMemo(() => {
        const query = search.trim().toLowerCase();
        const sorted = [...tags].sort((left, right) =>
            left.name.localeCompare(right.name)
        );

        if (query.length === 0) {
            return sorted;
        }

        return sorted.filter((tag) => tag.name.toLowerCase().includes(query));
    }, [search, tags]);

    const assignmentIdsByTagId = useMemo(() => {
        const idsByTagId = new Map<string, string[]>();

        for (const assignment of tagAssignments) {
            if (
                assignment.targetType !== targetType ||
                assignment.targetId !== targetId
            ) {
                continue;
            }

            const ids = idsByTagId.get(assignment.tagId) ?? [];
            ids.push(assignment.id);
            idsByTagId.set(assignment.tagId, ids);
        }

        return idsByTagId;
    }, [tagAssignments, targetId, targetType]);

    const toggleAssignment = (tagId: string) => {
        if (disabled) {
            return;
        }

        const existingIds = assignmentIdsByTagId.get(tagId) ?? [];

        if (existingIds.length > 0) {
            void removeTagAssignments(existingIds);
            return;
        }

        void addTagAssignments([
            {
                id: generateId(),
                tagId,
                targetType,
                targetId,
            },
        ]);
    };

    const createTag = async () => {
        const name = draftName.trim();

        if (disabled || name.length === 0) {
            return;
        }

        const tag: DiagramTag = {
            id: generateId(),
            name,
        };

        await addTags([tag]);
        await addTagAssignments([
            {
                id: generateId(),
                tagId: tag.id,
                targetType,
                targetId,
            },
        ]);
        setDraftName('');
    };

    const commitRename = (tag: DiagramTag) => {
        if (cancelRenameRef.current) {
            cancelRenameRef.current = false;
            return;
        }

        const name = renameValue.trim();
        setRenamingId(null);

        if (disabled || name.length === 0 || name === tag.name) {
            return;
        }

        void updateTag(tag.id, { name });
    };

    return (
        <div
            className="flex w-64 flex-col gap-2"
            onClick={stopMenuEvent}
            onPointerDown={stopMenuEvent}
        >
            <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={stopMenuEvent}
                placeholder={t('tags.search')}
                aria-label={t('tags.search')}
                className="h-8"
            />
            {tags.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">
                    {t('tags.empty')}
                </p>
            ) : visibleTags.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">
                    {t('tags.no_results')}
                </p>
            ) : (
                <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                    {visibleTags.map((tag) => {
                        const assigned =
                            (assignmentIdsByTagId.get(tag.id) ?? []).length > 0;

                        return (
                            <li
                                key={tag.id}
                                className="flex items-center gap-1.5"
                            >
                                <Checkbox
                                    checked={assigned}
                                    disabled={disabled}
                                    aria-label={tag.name}
                                    onCheckedChange={() =>
                                        toggleAssignment(tag.id)
                                    }
                                />
                                {renamingId === tag.id ? (
                                    <Input
                                        autoFocus
                                        value={renameValue}
                                        aria-label={t('tags.rename')}
                                        className="h-7 min-w-0 flex-1"
                                        onChange={(event) =>
                                            setRenameValue(event.target.value)
                                        }
                                        onBlur={() => commitRename(tag)}
                                        onKeyDown={(event) => {
                                            event.stopPropagation();
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                commitRename(tag);
                                            }
                                            if (event.key === 'Escape') {
                                                event.preventDefault();
                                                cancelRenameRef.current = true;
                                                setRenamingId(null);
                                            }
                                        }}
                                    />
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        title={tag.name}
                                        className="min-w-0 max-w-full flex-1 justify-start truncate font-normal"
                                    >
                                        {tag.name}
                                    </Badge>
                                )}
                                {!disabled ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="size-7 p-0"
                                            aria-label={t('tags.rename')}
                                            onClick={() => {
                                                setRenamingId(tag.id);
                                                setRenameValue(tag.name);
                                            }}
                                        >
                                            <Pencil
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="size-7 p-0 !text-red-700"
                                            aria-label={t('delete')}
                                            onClick={() =>
                                                void removeTags([tag.id])
                                            }
                                        >
                                            <Trash2
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                        </Button>
                                    </>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            )}
            {!disabled ? (
                <div className="flex items-center gap-1.5 border-t pt-2">
                    <Input
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        onKeyDown={(event) => {
                            event.stopPropagation();
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                void createTag();
                            }
                        }}
                        placeholder={t('tags.name_placeholder')}
                        aria-label={t('tags.name_placeholder')}
                        className="h-8 min-w-0 flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        aria-label={t('tags.create')}
                        disabled={draftName.trim().length === 0}
                        onClick={() => void createTag()}
                    >
                        <Plus className="size-3.5" aria-hidden="true" />
                    </Button>
                </div>
            ) : null}
        </div>
    );
};
