import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Group, Tags } from 'lucide-react';
import { Checkbox } from '@/components/checkbox/checkbox';
import { Tabs, TabsContent } from '@/components/tabs/tabs';
import { useEditorFilters } from '@/context/editor-filters-context/use-editor-filters';
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
    const { showViews, setShowViews } = useEditorFilters();
    const [tab, setTab] = useState<FiltersTab>('tags');
    const showViewsLabel = t('menu.view.show_views');

    return (
        <section
            className="flex flex-1 flex-col overflow-hidden"
            data-vaul-no-drag
        >
            <label className="flex items-center gap-2 border-b px-3 py-2 text-sm">
                <Checkbox
                    checked={showViews}
                    onCheckedChange={(value) => setShowViews(value === true)}
                    aria-label={showViewsLabel}
                    data-testid="filters-show-views"
                />
                <span>{showViewsLabel}</span>
            </label>
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
