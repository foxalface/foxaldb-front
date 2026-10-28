import React, { useCallback } from 'react';
import {
    SidePanelSectionTabsList,
    SidePanelSectionTabsTrigger,
} from '@/components/side-panel-section-tabs/side-panel-section-tabs';
import { Tabs } from '@/components/tabs/tabs';
import type { DiagramCreationDestination } from '@/lib/diagram/diagram-creation-destination';
import { Cloud, Laptop, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface CreateDiagramDestinationSelectorProps {
    destination: DiagramCreationDestination;
    onDestinationChange: (destination: DiagramCreationDestination) => void;
    onGuestRequestOnline: () => void;
    isAuthenticated: boolean;
}

export const CreateDiagramDestinationSelector: React.FC<
    CreateDiagramDestinationSelectorProps
> = ({
    destination,
    onDestinationChange,
    onGuestRequestOnline,
    isAuthenticated,
}) => {
    const { t } = useTranslation();

    const handleValueChange = useCallback(
        (value: string) => {
            if (value === 'online' && !isAuthenticated) {
                onGuestRequestOnline();
                return;
            }

            onDestinationChange(value as DiagramCreationDestination);
        },
        [isAuthenticated, onDestinationChange, onGuestRequestOnline]
    );

    return (
        <Tabs
            value={destination}
            onValueChange={handleValueChange}
            className="shrink-0"
        >
            <SidePanelSectionTabsList
                aria-label={t('new_diagram_dialog.destination.aria_label')}
            >
                <SidePanelSectionTabsTrigger value="device">
                    <Laptop className="size-3.5 shrink-0" aria-hidden="true" />
                    {t('open_diagram_dialog.tabs.device')}
                </SidePanelSectionTabsTrigger>
                <SidePanelSectionTabsTrigger value="online">
                    <Cloud className="size-3.5 shrink-0" aria-hidden="true" />
                    {!isAuthenticated ? (
                        <Lock
                            className="size-3.5 shrink-0"
                            aria-hidden="true"
                        />
                    ) : null}
                    {t('open_diagram_dialog.tabs.online')}
                </SidePanelSectionTabsTrigger>
            </SidePanelSectionTabsList>
        </Tabs>
    );
};
