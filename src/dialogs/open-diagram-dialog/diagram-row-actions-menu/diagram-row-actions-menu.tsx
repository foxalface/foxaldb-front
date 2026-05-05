import React, { useCallback } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import { Button } from '@/components/button/button';
import { Ellipsis, Layers2, SquareArrowOutUpRight, Trash2 } from 'lucide-react';
import { useChartDB } from '@/hooks/use-chartdb';
import type { Diagram } from '@/lib/domain';
import { useTranslation } from 'react-i18next';
import { deleteDiagram, duplicateDiagram } from '@/lib/api/diagrams';
import { useNavigate } from 'react-router-dom';

interface DiagramRowActionsMenuProps {
    diagram: Diagram;
    onOpen: () => void;
    onDuplicate?: () => void;
    refetch: () => void;
    numberOfDiagrams: number;
}

export const DiagramRowActionsMenu: React.FC<DiagramRowActionsMenuProps> = ({
    diagram,
    onOpen,
    onDuplicate,
    refetch,
    numberOfDiagrams,
}) => {
    const { diagramId } = useChartDB();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const onDelete = useCallback(async () => {
        await deleteDiagram(diagram.id);
        await refetch();

        if (diagram.id === diagramId || numberOfDiagrams <= 1) {
            navigate('/');
        }
    }, [diagram.id, diagramId, refetch, numberOfDiagrams, navigate]);

    const handleDuplicate = useCallback(async () => {
        const response = await duplicateDiagram(diagram.id);
        const duplicatedDiagramId = String(response.diagram.id);

        await refetch();
        onDuplicate?.();
        navigate(`/diagrams/${duplicatedDiagramId}`);
    }, [diagram.id, refetch, onDuplicate, navigate]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Ellipsis className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={onOpen}
                    className="flex justify-between gap-4"
                >
                    {t('open_diagram_dialog.diagram_actions.open')}
                    <SquareArrowOutUpRight className="size-3.5" />
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={handleDuplicate}
                    className="flex justify-between gap-4"
                >
                    {t('open_diagram_dialog.diagram_actions.duplicate')}
                    <Layers2 className="size-3.5" />
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={onDelete}
                    className="flex justify-between gap-4 text-red-700"
                >
                    {t('open_diagram_dialog.diagram_actions.delete')}
                    <Trash2 className="size-3.5 text-red-700" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
