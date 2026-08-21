import React, { useCallback, useEffect } from 'react';
import { CircleDotDashed, Trash2, Check } from 'lucide-react';
import { ListItemHeaderButton } from '../../../../list-item-header-button/list-item-header-button';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import { useReactFlow } from '@xyflow/react';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';
import { useFocusOn } from '@/hooks/use-focus-on';
import { useEditingBroadcast } from '@/hooks/use-editing-broadcast';
import { useEditingConflictWarning } from '@/hooks/use-editing-conflict-warning';
import { useEditingConflictExplanation } from '@/hooks/use-editing-conflict-explanation';
import { useEntityRemoteEditing } from '@/hooks/use-remote-editing';
import { EntityEditingBadge } from '@/components/presence/entity-editing-badge';
import { EntityConflictHint } from '@/components/presence/entity-conflict-hint';
import { createRelationshipEditingItem } from '@/lib/realtime/editing-utils';
import { useClickAway, useKeyPressEvent } from 'react-use';
import { Input } from '@/components/input/input';
import { useTranslation } from 'react-i18next';
import { ConversationIndicator } from '@/components/conversation-indicator/conversation-indicator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';

export interface RelationshipListItemHeaderProps {
    relationship: DBRelationship;
    onLocalEditingChange?: (isLocallyEditing: boolean) => void;
}

export interface RelationshipListItemEditingConflictProps {
    relationshipId: string;
    isLocallyEditing: boolean;
}

export const RelationshipListItemEditingConflict: React.FC<
    RelationshipListItemEditingConflictProps
> = ({ relationshipId, isLocallyEditing }) => {
    const { message, editors, hasConflict } = useEditingConflictWarning(
        'relationship',
        relationshipId,
        {
            isLocallyEditing,
        }
    );
    const description = useEditingConflictExplanation(hasConflict);

    return (
        <EntityConflictHint
            message={message}
            editors={editors}
            description={description}
        />
    );
};

export const RelationshipListItemHeader: React.FC<
    RelationshipListItemHeaderProps
> = ({ relationship, onLocalEditingChange }) => {
    const { updateRelationship, removeRelationship, readonly } = useChartDB();
    const { deleteElements } = useReactFlow();
    const { t } = useTranslation();
    const { focusOnRelationship } = useFocusOn();
    const { startEditing, stopEditing } = useEditingBroadcast();
    const conversationsAvailable = useConversationsAvailability();
    const remoteEditors = useEntityRemoteEditing(
        'relationship',
        relationship.id
    );
    const [editMode, setEditMode] = React.useState(false);
    const [relationshipName, setRelationshipName] = React.useState(
        relationship.name
    );
    const inputRef = React.useRef<HTMLInputElement>(null);

    const setLocalEditing = useCallback(
        (isEditing: boolean) => {
            onLocalEditingChange?.(isEditing);
        },
        [onLocalEditingChange]
    );

    const editRelationshipName = useCallback(() => {
        if (!editMode) return;
        if (relationshipName.trim() && relationshipName !== relationship.name) {
            updateRelationship(relationship.id, {
                name: relationshipName.trim(),
            });
        }

        // The input may unmount before blur fires.
        setLocalEditing(false);
        setEditMode(false);
    }, [
        relationshipName,
        relationship.id,
        updateRelationship,
        editMode,
        relationship.name,
        setLocalEditing,
    ]);

    useClickAway(inputRef, editRelationshipName);
    useKeyPressEvent('Enter', editRelationshipName);

    const abortEdit = useCallback(() => {
        setLocalEditing(false);
        setEditMode(false);
        setRelationshipName(relationship.name);
    }, [relationship.name, setLocalEditing]);

    useKeyPressEvent('Escape', abortEdit);

    const enterEditMode = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        setEditMode(true);
    }, []);

    useEffect(() => {
        if (relationship.name.trim()) {
            setRelationshipName(relationship.name.trim());
        }
    }, [relationship.name]);

    const handleFocusOnRelationship = useCallback(
        (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            event.stopPropagation();
            focusOnRelationship(
                relationship.id,
                relationship.sourceTableId,
                relationship.targetTableId
            );
        },
        [
            focusOnRelationship,
            relationship.id,
            relationship.sourceTableId,
            relationship.targetTableId,
        ]
    );

    const deleteRelationshipHandler = useCallback(
        (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            event.stopPropagation();
            removeRelationship(relationship.id);
            deleteElements({
                edges: [{ id: relationship.id }],
            });
        },
        [relationship.id, removeRelationship, deleteElements]
    );

    return (
        <div className="group flex h-11 w-full flex-1 items-center justify-between gap-1 overflow-hidden">
            <div className="flex min-w-0 flex-1 px-1">
                {editMode ? (
                    <Input
                        ref={inputRef}
                        autoFocus
                        type="text"
                        placeholder={relationship.name}
                        value={relationshipName}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRelationshipName(e.target.value)}
                        onFocus={() => {
                            setLocalEditing(true);
                            startEditing(
                                createRelationshipEditingItem(relationship.id)
                            );
                        }}
                        onBlur={() => {
                            setLocalEditing(false);
                            stopEditing();
                        }}
                        className="side-panel-group-hover-surface h-7 w-full focus-visible:ring-0"
                    />
                ) : !readonly ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                onDoubleClick={enterEditMode}
                                className="text-editable truncate px-2 py-0.5"
                            >
                                {relationship.name}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {t('tool_tips.double_click_to_edit')}
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <div className="truncate px-2 py-0.5">
                        {relationship.name}
                    </div>
                )}
            </div>
            {remoteEditors.length > 0 ? (
                <EntityEditingBadge
                    editors={remoteEditors}
                    className="mr-1 shrink-0"
                />
            ) : null}
            <div className="flex flex-row-reverse items-center">
                {!editMode ? (
                    <>
                        {!readonly ? (
                            <ListItemHeaderButton
                                onClick={deleteRelationshipHandler}
                                aria-label={t('delete')}
                                role="button"
                                className="!text-red-700 hover:!text-red-700 dark:!text-red-700 dark:hover:!text-red-700"
                            >
                                <Trash2 />
                            </ListItemHeaderButton>
                        ) : null}
                        <div className="flex items-center md:hidden md:group-focus-within:flex md:group-hover:flex">
                            <ListItemHeaderButton
                                onClick={handleFocusOnRelationship}
                            >
                                <CircleDotDashed />
                            </ListItemHeaderButton>
                            {conversationsAvailable ? (
                                <ConversationIndicator
                                    appearance="list-item-header"
                                    highlightWhenActive={false}
                                    showTooltip={false}
                                    target={{
                                        targetType: 'relationship',
                                        targetId: relationship.id,
                                    }}
                                    targetName={relationship.name}
                                />
                            ) : null}
                        </div>
                    </>
                ) : (
                    <ListItemHeaderButton onClick={editRelationshipName}>
                        <Check />
                    </ListItemHeaderButton>
                )}
            </div>
        </div>
    );
};
