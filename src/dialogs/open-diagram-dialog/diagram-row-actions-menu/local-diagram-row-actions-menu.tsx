import React, { useCallback } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import { Button } from '@/components/button/button';
import {
    CloudUpload,
    EllipsisVertical,
    Layers2,
    SquareArrowOutUpRight,
    Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useChartDB } from '@/hooks/use-chartdb';
import { useStorage } from '@/hooks/use-storage';
import { useConfig } from '@/hooks/use-config';
import { useAlert } from '@/context/alert-context/alert-context';
import { useToast } from '@/components/toast/use-toast';
import { duplicateLocalDiagram } from '@/lib/diagram/duplicate-local-diagram';
import {
    putLocalDiagramOnlineCopy,
    putLocalDiagramOnlineMove,
} from '@/lib/diagram/put-local-diagram-online';
import {
    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';

interface LocalDiagramRowActionsMenuProps {
    diagramId: string;
    isAuthenticated: boolean;
    onOpen: () => void;
    onListChanged: () => void;
    numberOfLocalDiagrams: number;
}

export const LocalDiagramRowActionsMenu: React.FC<
    LocalDiagramRowActionsMenuProps
> = ({
    diagramId,
    isAuthenticated,
    onOpen,
    onListChanged,
    numberOfLocalDiagrams,
}) => {
    const { diagramId: activeDiagramId, deleteDiagram: deleteLocalDiagram } =
        useChartDB();
    const { getDiagram, addDiagram, deleteDiagram } = useStorage();
    const { updateConfig } = useConfig();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { toast } = useToast();

    const showPutOnlineFailed = useCallback(() => {
        toast({
            title: t('open_diagram_dialog.errors.put_online_failed'),
            variant: 'destructive',
        });
    }, [toast, t]);

    const onDeleteConfirmed = useCallback(async () => {
        if (diagramId === activeDiagramId) {
            await deleteLocalDiagram();
        } else {
            await deleteDiagram(diagramId);
        }

        await onListChanged();

        if (diagramId === activeDiagramId || numberOfLocalDiagrams <= 1) {
            navigate('/');
        }
    }, [
        diagramId,
        deleteDiagram,
        deleteLocalDiagram,
        onListChanged,
        activeDiagramId,
        numberOfLocalDiagrams,
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
        try {
            const duplicateId = await duplicateLocalDiagram(
                getDiagram,
                addDiagram,
                diagramId
            );
            await onListChanged();
            navigate(`/diagrams/${duplicateId}`);
        } catch {
            toast({
                title: t('open_diagram_dialog.errors.duplicate_failed'),
                variant: 'destructive',
            });
        }
    }, [getDiagram, addDiagram, diagramId, onListChanged, navigate, toast, t]);

    const handlePutOnlineCopy = useCallback(async () => {
        try {
            const remoteId = await putLocalDiagramOnlineCopy(
                getDiagram,
                diagramId
            );
            await updateConfig({ config: { defaultDiagramId: remoteId } });
            navigate(`/diagrams/${remoteId}`);
        } catch {
            showPutOnlineFailed();
        }
    }, [getDiagram, diagramId, updateConfig, navigate, showPutOnlineFailed]);

    const handlePutOnlineMove = useCallback(async () => {
        try {
            const remoteId = await putLocalDiagramOnlineMove(
                getDiagram,
                deleteDiagram,
                diagramId
            );
            await onListChanged();

            if (diagramId === activeDiagramId) {
                await deleteLocalDiagram().catch(() => undefined);
            }

            await updateConfig({ config: { defaultDiagramId: remoteId } });
            navigate(`/diagrams/${remoteId}`);
        } catch {
            showPutOnlineFailed();
        }
    }, [
        getDiagram,
        deleteDiagram,
        diagramId,
        onListChanged,
        activeDiagramId,
        deleteLocalDiagram,
        updateConfig,
        navigate,
        showPutOnlineFailed,
    ]);

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

                {isAuthenticated ? (
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger
                            className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                        >
                            <CloudUpload
                                className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                            />
                            {t('open_diagram_dialog.put_online.label')}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem
                                onClick={handlePutOnlineCopy}
                                className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                            >
                                {t('open_diagram_dialog.put_online.copy')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handlePutOnlineMove}
                                className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                            >
                                {t('open_diagram_dialog.put_online.move')}
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                ) : (
                    <DropdownMenuItem
                        disabled
                        className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                    >
                        <CloudUpload
                            className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                        />
                        {t('open_diagram_dialog.put_online.sign_in_required')}
                    </DropdownMenuItem>
                )}

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
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
