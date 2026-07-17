import React, { useCallback } from 'react';
import {
    Pencil,
    EllipsisVertical,
    CircleDotDashed,
    Trash2,
    Check,
} from 'lucide-react';
import { ListItemHeaderButton } from '../../../../list-item-header-button/list-item-header-button';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import { useReactFlow } from '@xyflow/react';
import { useChartDB } from '@/hooks/use-chartdb';
import { useFocusOn } from '@/hooks/use-focus-on';
import { useEditingBroadcast } from '@/hooks/use-editing-broadcast';
import { useEditingConflictWarning } from '@/hooks/use-editing-conflict-warning';
import { useEntityRemoteEditing } from '@/hooks/use-remote-editing';
import { EntityEditingBadge } from '@/components/presence/entity-editing-badge';
import { EntityConflictHint } from '@/components/presence/entity-conflict-hint';
import { createRelationshipEditingItem } from '@/lib/realtime/editing-utils';
import { useClickAway, useKeyPressEvent } from 'react-use';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import { Input } from '@/components/input/input';
import { useTranslation } from 'react-i18next';

export interface RelationshipListItemHeaderProps {
    relationship: DBRelationship;
}

export const RelationshipListItemHeader: React.FC<
    RelationshipListItemHeaderProps
> = ({ relationship }) => {
    const { updateRelationship, removeRelationship, readonly } = useChartDB();
    const { deleteElements } = useReactFlow();
    const { t } = useTranslation();
    const { focusOnRelationship } = useFocusOn();
    const { startEditing, stopEditing } = useEditingBroadcast();
    const remoteEditors = useEntityRemoteEditing(
        'relationship',
        relationship.id
    );
    const [editMode, setEditMode] = React.useState(false);
    const [isLocallyEditing, setIsLocallyEditing] = React.useState(false);
    const { message, editors } = useEditingConflictWarning(
        'relationship',
        relationship.id,
        {
            isLocallyEditing,
        }
    );
    const [relationshipName, setRelationshipName] = React.useState(
        relationship.name
    );
    const inputRef = React.useRef<HTMLInputElement>(null);

    const editRelationshipName = useCallback(() => {
        if (!editMode) return;
        if (relationshipName.trim() && relationshipName !== relationship.name) {
            updateRelationship(relationship.id, {
                name: relationshipName.trim(),
            });
        }

        // The input may unmount before blur fires.
        setIsLocallyEditing(false);
        setEditMode(false);
    }, [
        relationshipName,
        relationship.id,
        updateRelationship,
        editMode,
        relationship.name,
    ]);

    useClickAway(inputRef, editRelationshipName);
    useKeyPressEvent('Enter', editRelationshipName);

    const enterEditMode = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.stopPropagation();
        setEditMode(true);
    };

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

    const deleteRelationshipHandler = useCallback(() => {
        removeRelationship(relationship.id);
        deleteElements({
            edges: [{ id: relationship.id }],
        });
    }, [relationship.id, removeRelationship, deleteElements]);

    const renderDropDownMenu = useCallback(
        () => (
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <ListItemHeaderButton>
                        <EllipsisVertical />
                    </ListItemHeaderButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                    <DropdownMenuLabel>
                        {t(
                            'side_panel.refs_section.relationship.relationship_actions.title'
                        )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={deleteRelationshipHandler}
                            className="flex justify-between !text-red-700"
                        >
                            {t(
                                'side_panel.refs_section.relationship.relationship_actions.delete_relationship'
                            )}
                            <Trash2 className="size-3.5 text-red-700" />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        [deleteRelationshipHandler, t]
    );

    return (
        <div className="flex min-w-0 flex-1 flex-col">
            <div className="group flex h-11 flex-1 items-center justify-between gap-1 overflow-hidden">
                <div className="flex min-w-0 flex-1">
                    {editMode ? (
                        <Input
                            ref={inputRef}
                            autoFocus
                            type="text"
                            placeholder={relationship.name}
                            value={relationshipName}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                setRelationshipName(e.target.value)
                            }
                            onFocus={() => {
                                setIsLocallyEditing(true);
                                startEditing(
                                    createRelationshipEditingItem(
                                        relationship.id
                                    )
                                );
                            }}
                            onBlur={() => {
                                setIsLocallyEditing(false);
                                stopEditing();
                            }}
                            className="h-7 w-full focus-visible:ring-0"
                        />
                    ) : (
                        <div className="truncate">{relationship.name}</div>
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
                                <div>{renderDropDownMenu()}</div>
                            ) : null}
                            <div className="flex flex-row-reverse md:hidden md:group-hover:flex">
                                {!readonly ? (
                                    <ListItemHeaderButton
                                        onClick={enterEditMode}
                                    >
                                        <Pencil />
                                    </ListItemHeaderButton>
                                ) : null}
                                <ListItemHeaderButton
                                    onClick={handleFocusOnRelationship}
                                >
                                    <CircleDotDashed />
                                </ListItemHeaderButton>
                            </div>
                        </>
                    ) : (
                        <ListItemHeaderButton onClick={editRelationshipName}>
                            <Check />
                        </ListItemHeaderButton>
                    )}
                </div>
            </div>
            <EntityConflictHint message={message} editors={editors} />
        </div>
    );
};
