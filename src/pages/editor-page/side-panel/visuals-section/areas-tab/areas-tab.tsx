import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/button/button';
import { Group } from 'lucide-react';
import { Input } from '@/components/input/input';
import type { Area } from '@/lib/domain/area';
import { useChartDB } from '@/hooks/use-chartdb';
import { useLayout } from '@/hooks/use-layout';
import {
    SidePanelEmptyState,
    SidePanelEmptyStateViewport,
    sidePanelEmptyStateIcon,
} from '@/components/side-panel-empty-state/side-panel-empty-state';
import { SidePanelFilterEmptyState } from '@/components/side-panel-empty-state/side-panel-filter-empty-state';
import { useTranslation } from 'react-i18next';
import { useViewport } from '@xyflow/react';
import { AreaList } from './areas-list/areas-list';

export interface AreasTabProps {}

export const AreasTab: React.FC<AreasTabProps> = () => {
    const { createArea, areas, readonly } = useChartDB();
    const viewport = useViewport();
    const { t } = useTranslation();
    const { openAreaFromSidebar } = useLayout();
    const [filterText, setFilterText] = React.useState('');
    const filterInputRef = React.useRef<HTMLInputElement>(null);

    const filteredAreas = useMemo(() => {
        const filterAreaName: (area: Area) => boolean = (area) =>
            !filterText?.trim?.() ||
            area.name.toLowerCase().includes(filterText.toLowerCase());

        return areas.filter(filterAreaName);
    }, [areas, filterText]);

    const createAreaWithLocation = useCallback(async () => {
        const padding = 80;
        const centerX = -viewport.x / viewport.zoom + padding / viewport.zoom;
        const centerY = -viewport.y / viewport.zoom + padding / viewport.zoom;
        const area = await createArea({
            x: centerX,
            y: centerY,
        });
        if (openAreaFromSidebar) {
            openAreaFromSidebar(area.id);
        }
    }, [
        createArea,
        openAreaFromSidebar,
        viewport.x,
        viewport.y,
        viewport.zoom,
    ]);

    const handleCreateArea = useCallback(async () => {
        setFilterText('');
        createAreaWithLocation();
    }, [createAreaWithLocation, setFilterText]);

    const handleClearFilter = useCallback(() => {
        setFilterText('');
    }, []);

    return (
        <div className="flex flex-1 flex-col overflow-hidden px-2">
            <div className="flex items-center gap-2 pb-1">
                <div className="flex-1">
                    <Input
                        ref={filterInputRef}
                        type="text"
                        placeholder={t('side_panel.areas_section.filter')}
                        className="h-8 w-full focus-visible:ring-0"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                {!readonly ? (
                    <Button
                        variant="secondary"
                        className="h-8 p-2 text-xs"
                        onClick={handleCreateArea}
                    >
                        <Group className="h-4" />
                        {t('side_panel.areas_section.add_area')}
                    </Button>
                ) : null}
            </div>
            <SidePanelEmptyStateViewport>
                {areas.length === 0 ? (
                    <SidePanelEmptyState
                        icon={sidePanelEmptyStateIcon}
                        title={t('side_panel.areas_section.empty_state.title')}
                        description={t(
                            'side_panel.areas_section.empty_state.description'
                        )}
                        secondaryAction={
                            !readonly
                                ? {
                                      label: t(
                                          'side_panel.areas_section.add_area'
                                      ),
                                      onClick: handleCreateArea,
                                  }
                                : undefined
                        }
                    />
                ) : filterText && filteredAreas.length === 0 ? (
                    <SidePanelFilterEmptyState
                        title={t('side_panel.areas_section.no_results')}
                        clearLabel={t('side_panel.areas_section.clear')}
                        onClearFilter={handleClearFilter}
                    />
                ) : (
                    <AreaList areas={filteredAreas} />
                )}
            </SidePanelEmptyStateViewport>
        </div>
    );
};
