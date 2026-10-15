import React, { useCallback, useState } from 'react';
import { Scan, ZoomIn, ZoomOut } from 'lucide-react';
import { useOnViewportChange, useReactFlow } from '@xyflow/react';
import { Button } from '@/components/button/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { useTranslation } from 'react-i18next';

const toPercentage = (value: number): string => `${Math.round(value * 100)}%`;

export const MergePreviewControls: React.FC = () => {
    const { t } = useTranslation();
    const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
    const [zoomLabel, setZoomLabel] = useState(() => toPercentage(getZoom()));
    const zoomDuration = 200;

    useOnViewportChange({
        onChange: ({ zoom }) => {
            setZoomLabel(toPercentage(zoom));
        },
    });

    const handleZoomIn = useCallback(() => {
        zoomIn({ duration: zoomDuration });
    }, [zoomIn]);

    const handleZoomOut = useCallback(() => {
        zoomOut({ duration: zoomDuration });
    }, [zoomOut]);

    const handleFitView = useCallback(() => {
        fitView({ padding: 0.1, maxZoom: 0.8, duration: zoomDuration });
    }, [fitView]);

    return (
        <div
            className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-md border border-border bg-secondary/95 p-1 shadow-sm"
            data-testid="merge-preview-controls"
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={t('toolbar.zoom_out')}
                        onClick={handleZoomOut}
                    >
                        <ZoomOut className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{t('toolbar.zoom_out')}</TooltipContent>
            </Tooltip>
            <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground">
                {zoomLabel}
            </span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={t('toolbar.zoom_in')}
                        onClick={handleZoomIn}
                    >
                        <ZoomIn className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{t('toolbar.zoom_in')}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={t('toolbar.show_all')}
                        onClick={handleFitView}
                    >
                        <Scan className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{t('toolbar.show_all')}</TooltipContent>
            </Tooltip>
        </div>
    );
};
