import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Group, Tags } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/tabs/tabs';
import {
    SidePanelSectionTabsList,
    SidePanelSectionTabsToolbar,
    SidePanelSectionTabsTrigger,
} from '@/components/side-panel-section-tabs/side-panel-section-tabs';
import { AreasFilterTab } from './areas-filter-tab';
import { SchemasFilterTab } from './schemas-filter-tab';
import { TagsFilterTab } from './tags-filter-tab';

type FiltersTab = 'tags' | 'areas' | 'schemas';

export const FiltersSection: React.FC = () => {
    const { t } = useTranslation();
    const [tab, setTab] = useState<FiltersTab>('tags');

    return (
        <section
            className="flex flex-1 flex-col overflow-hidden"
            data-vaul-no-drag
        >
            <Tabs
                value={tab}
                onValueChange={(value) => setTab(value as FiltersTab)}
                className="flex flex-1 flex-col overflow-hidden"
            >
                <SidePanelSectionTabsToolbar>
                    <SidePanelSectionTabsList className="grid-cols-3">
                        <SidePanelSectionTabsTrigger value="tags">
                            <Tags className="size-3.5" aria-hidden="true" />
                            {t('tags.title')}
                        </SidePanelSectionTabsTrigger>
                        <SidePanelSectionTabsTrigger value="areas">
                            <Group className="size-3.5" aria-hidden="true" />
                            {t('side_panel.visuals_section.tabs.areas')}
                        </SidePanelSectionTabsTrigger>
                        <SidePanelSectionTabsTrigger value="schemas">
                            <Database className="size-3.5" aria-hidden="true" />
                            {t('side_panel.filters_section.tabs.schemas')}
                        </SidePanelSectionTabsTrigger>
                    </SidePanelSectionTabsList>
                </SidePanelSectionTabsToolbar>
                <TabsContent
                    value="tags"
                    className="mt-0 flex flex-1 flex-col overflow-hidden px-2 data-[state=inactive]:hidden"
                >
                    <TagsFilterTab />
                </TabsContent>
                <TabsContent
                    value="areas"
                    className="mt-0 flex flex-1 flex-col overflow-hidden px-2 data-[state=inactive]:hidden"
                >
                    <AreasFilterTab />
                </TabsContent>
                <TabsContent
                    value="schemas"
                    className="mt-0 flex flex-1 flex-col overflow-hidden px-2 data-[state=inactive]:hidden"
                >
                    <SchemasFilterTab />
                </TabsContent>
            </Tabs>
        </section>
    );
};
