import React, { useCallback, useMemo, useRef } from 'react';
import { Trash2, ArrowLeftRight, CircleDotDashed } from 'lucide-react';
import { SlBubbles } from 'react-icons/sl';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Spinner } from '@/components/spinner/spinner';
import type { Cardinality } from '@/lib/domain/db-relationship';
import { cn } from '@/lib/utils';
import { useClickAway } from 'react-use';
import { useCanvas } from '@/hooks/use-canvas';
import { useLayout } from '@/hooks/use-layout';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';
import { useOpenTargetConversation } from '@/hooks/use-open-target-conversation';

export interface EditRelationshipPopoverProps {
    anchorPosition: { x: number; y: number };
    relationshipId: string;
    sourceCardinality: Cardinality;
    targetCardinality: Cardinality;
    onCardinalityChange: (
        sourceCardinality: Cardinality,
        targetCardinality: Cardinality
    ) => void;
    onSwitch: () => void;
    onDelete: () => void;
}

type RelationshipTypeOption = {
    label: string;
    sourceCardinality: Cardinality;
    targetCardinality: Cardinality;
};

const relationshipTypes: RelationshipTypeOption[] = [
    { label: '1:1', sourceCardinality: 'one', targetCardinality: 'one' },
    { label: '1:N', sourceCardinality: 'one', targetCardinality: 'many' },
];

export const EditRelationshipPopover: React.FC<
    EditRelationshipPopoverProps
> = ({
    anchorPosition,
    relationshipId,
    sourceCardinality,
    targetCardinality,
    onCardinalityChange,
    onSwitch,
    onDelete,
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const { closeRelationshipPopover } = useCanvas();
    const { selectSidebarSection, openRelationshipFromSidebar } = useLayout();
    const { relationships } = useChartDB();
    const { t } = useTranslation();
    const conversationsAvailable = useConversationsAvailability();
    const relationshipName = useMemo(
        () =>
            relationships.find(
                (relationship) => relationship.id === relationshipId
            )?.name ?? relationshipId,
        [relationshipId, relationships]
    );
    const { hasActiveConversation, canCreate, isPending, openConversation } =
        useOpenTargetConversation({
            targetType: 'relationship',
            targetId: relationshipId,
        });
    const showConversationAction =
        conversationsAvailable && (hasActiveConversation || canCreate);
    const conversationAriaLabel = hasActiveConversation
        ? t('side_panel.conversations_section.target_entry.open_aria', {
              name: relationshipName,
          })
        : t('side_panel.conversations_section.target_entry.start_aria', {
              name: relationshipName,
          });
    const conversationTooltip = t(
        'side_panel.conversations_section.target_entry.action_tooltip'
    );

    useClickAway(popoverRef, closeRelationshipPopover);

    const openRelationshipInSidebar = useCallback(() => {
        selectSidebarSection('refs');
        openRelationshipFromSidebar(relationshipId);
        closeRelationshipPopover();
    }, [
        selectSidebarSection,
        openRelationshipFromSidebar,
        relationshipId,
        closeRelationshipPopover,
    ]);

    const handleOpenConversation = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            void openConversation();
        },
        [openConversation]
    );

    return (
        <div
            ref={popoverRef}
            className="fixed z-50 rounded-md border bg-popover p-2 text-popover-foreground shadow-md"
            style={{
                left: anchorPosition.x,
                top: anchorPosition.y + 10,
            }}
        >
            <div className="flex items-center gap-1">
                {relationshipTypes.map((type) => {
                    const isActive =
                        type.sourceCardinality === sourceCardinality &&
                        type.targetCardinality === targetCardinality;
                    return (
                        <Button
                            key={type.label}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                                'h-7 w-11 text-xs font-medium',
                                isActive &&
                                    'bg-slate-700 text-white hover:bg-slate-600'
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onCardinalityChange(
                                    type.sourceCardinality,
                                    type.targetCardinality
                                );
                            }}
                        >
                            {type.label}
                        </Button>
                    );
                })}
                <div className="mx-1 h-6 w-px bg-slate-300" />
                <Button
                    variant="ghost"
                    size="sm"
                    className="size-7 p-0 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSwitch();
                    }}
                    title="Switch tables"
                >
                    <ArrowLeftRight className="!size-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="size-7 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openRelationshipInSidebar();
                    }}
                    title="Open in sidebar"
                >
                    <CircleDotDashed className="!size-3.5" />
                </Button>
                {showConversationAction ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="size-7 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        onClick={handleOpenConversation}
                        disabled={isPending}
                        aria-busy={isPending}
                        aria-label={conversationAriaLabel}
                        title={conversationTooltip}
                    >
                        {isPending ? (
                            <Spinner size="small" className="!size-3.5" />
                        ) : (
                            <SlBubbles
                                className="!size-3.5"
                                aria-hidden="true"
                            />
                        )}
                    </Button>
                ) : null}
                <Button
                    variant="ghost"
                    size="sm"
                    className="size-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={onDelete}
                    title="Delete relationship"
                >
                    <Trash2 className="!size-3.5" />
                </Button>
            </div>
        </div>
    );
};
