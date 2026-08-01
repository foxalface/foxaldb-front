import React from 'react';
import { Tabs, TabsContent } from '@/components/tabs/tabs';
import {
    SidePanelSectionTabsList,
    SidePanelSectionTabsToolbar,
    SidePanelSectionTabsTrigger,
} from '@/components/side-panel-section-tabs/side-panel-section-tabs';
import { AreasTab } from './areas-tab/areas-tab';
import { NotesTab } from './notes-tab/notes-tab';
import { useTranslation } from 'react-i18next';
import { useLayout } from '@/hooks/use-layout';
import type { VisualsTab } from '@/context/layout-context/layout-context';
import { Group, StickyNote } from 'lucide-react';

export interface VisualsSectionProps {}

export const VisualsSection: React.FC<VisualsSectionProps> = () => {
    const { t } = useTranslation();
    const { selectedVisualsTab, selectVisualsTab } = useLayout();

    return (
        <section
            className="flex flex-1 flex-col overflow-hidden"
            data-vaul-no-drag
        >
            <Tabs
                value={selectedVisualsTab}
                onValueChange={(value) => selectVisualsTab(value as VisualsTab)}
                className="flex flex-1 flex-col overflow-hidden"
            >
                <SidePanelSectionTabsToolbar>
                    <SidePanelSectionTabsList>
                        <SidePanelSectionTabsTrigger value="areas">
                            <Group className="size-3.5" aria-hidden="true" />
                            {t('side_panel.visuals_section.tabs.areas')}
                        </SidePanelSectionTabsTrigger>
                        <SidePanelSectionTabsTrigger value="notes">
                            <StickyNote
                                className="size-3.5"
                                aria-hidden="true"
                            />
                            {t('side_panel.visuals_section.tabs.notes')}
                        </SidePanelSectionTabsTrigger>
                    </SidePanelSectionTabsList>
                </SidePanelSectionTabsToolbar>

                <TabsContent
                    value="areas"
                    className="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <AreasTab />
                </TabsContent>

                <TabsContent
                    value="notes"
                    className="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <NotesTab />
                </TabsContent>
            </Tabs>
        </section>
    );
};
