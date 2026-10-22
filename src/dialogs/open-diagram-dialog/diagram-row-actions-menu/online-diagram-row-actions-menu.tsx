import React, { useCallback } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import { Button } from '@/components/button/button';
import {
    EllipsisVertical,
    Layers2,
    SquareArrowOutUpRight,
    Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    deleteDiagram,
    duplicateDiagram,
    type DiagramAccessRole,
} from '@/lib/api/diagrams';
import { useChartDB } from '@/hooks/use-chartdb';
import { useAlert } from '@/context/alert-context/alert-context';
import {
    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';

interface OnlineDiagramRowActionsMenuProps {
    diagramId: string;
    role: DiagramAccessRole;
    onOpen: () => void;
    onListChanged: () => void;
    numberOfOnlineDiagrams: number;
}

export const OnlineDiagramRowActionsMenu: React.FC<
    OnlineDiagramRowActionsMenuProps
> = ({ diagramId, role, onOpen, onListChanged, numberOfOnlineDiagrams }) => {
    const { diagramId: activeDiagramId } = useChartDB();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    const canDelete = role === 'owner';

    const onDeleteConfirmed = useCallback(async () => {
        await deleteDiagram(diagramId);
        await onListChanged();

        if (diagramId === activeDiagramId || numberOfOnlineDiagrams <= 1) {
            navigate('/');
        }
    }, [
        diagramId,
        activeDiagramId,
        onListChanged,
        numberOfOnlineDiagrams,
        navigate,
    ]);

    const handleDelete = useCallback(() => {
        showAlert({
            title: t('delete_diagram_alert.title'),
            description: t('delete_diagram_alert.description'),
            actionLabel: t('delete_diagram_alert.delete'),
            closeLabel: t('delete_diagram_alert.cancel'),
            onAction: onDeleteConfirmed,
        });
    }, [showAlert, t, onDeleteConfirmed]);

    const handleDuplicate = useCallback(async () => {
        const response = await duplicateDiagram(diagramId);
        const duplicatedDiagramId = String(response.diagram.id);

        await onListChanged();
        navigate(`/diagrams/${duplicatedDiagramId}`);
    }, [diagramId, onListChanged, navigate]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <EllipsisVertical className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={onOpen}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <SquareArrowOutUpRight
                        className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                    />
                    {t('open_diagram_dialog.diagram_actions.open')}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={handleDuplicate}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <Layers2 className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                    {t('open_diagram_dialog.diagram_actions.duplicate')}
                </DropdownMenuItem>

                {canDelete ? (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className={`${SIDE_PANEL_ACTION_MENU_ITEM_CLASS} text-red-700`}
                        >
                            <Trash2
                                className={
                                    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS
                                }
                            />
                            {t('open_diagram_dialog.diagram_actions.delete')}
                        </DropdownMenuItem>
                    </>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
