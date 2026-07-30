import React, { Suspense } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import { TablesSection } from './tables-section/tables-section';
import { useLayout } from '@/hooks/use-layout';
import type { SidebarSection } from '@/context/layout-context/layout-context';
import { useTranslation } from 'react-i18next';
import { useChartDB } from '@/hooks/use-chartdb';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { CustomTypesSection } from './custom-types-section/custom-types-section';
import { supportsCustomTypes } from '@/lib/domain/database-capabilities';
import { RefsSection } from './refs-section/refs-section';
import { VisualsSection } from './visuals-section/visuals-section';
import { CommentsSection } from './comments-section/comments-section';
import { ConversationsSection } from './conversations-section/conversations-section';
import { Spinner } from '@/components/spinner/spinner';
import { useEditorDiscussionAvailability } from '@/hooks/use-editor-discussion-availability';

const DBMLSectionLazy = React.lazy(() =>
    import('./dbml-section/dbml-section').then((module) => ({
        default: module.DBMLSection,
    }))
);

export interface SidePanelProps {}

export const SidePanel: React.FC<SidePanelProps> = () => {
    const { t } = useTranslation();
    const { databaseType } = useChartDB();
    const {
        selectSidebarSection,
        selectedSidebarSection,
        openAllDiscussions,
        openConversationsPanel,
    } = useLayout();
    const { isMd: isDesktop } = useBreakpoint('md');
    const {
        conversationsAvailable,
        showLegacyCommentsEntry,
        showStandardCommentsEntry,
    } = useEditorDiscussionAvailability();

    const handleMobileSectionChange = (value: string) => {
        if (value === 'conversations') {
            if (selectedSidebarSection !== 'conversations') {
                openConversationsPanel();
            }
            return;
        }
        if (value === 'comments') {
            if (selectedSidebarSection !== 'comments') {
                openAllDiscussions();
            }
            return;
        }
        selectSidebarSection(value as SidebarSection);
    };

    return (
        <aside className="flex h-full flex-col overflow-hidden">
            {!isDesktop ? (
                <div className="flex justify-center border-b pt-0.5">
                    <Select
                        value={selectedSidebarSection}
                        onValueChange={handleMobileSectionChange}
                    >
                        <SelectTrigger className="rounded-none border-none font-semibold shadow-none hover:bg-secondary hover:underline focus:border-transparent focus:ring-0">
                            <SelectValue />
                            <div className="flex flex-1 justify-end px-2 text-xs font-normal text-muted-foreground">
                                {t('side_panel.view_all_options')}
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="tables">
                                    {t('side_panel.tables_section.tables')}
                                </SelectItem>
                                <SelectItem value="refs">
                                    {t('side_panel.refs_section.refs')}
                                </SelectItem>
                                <SelectItem value="areas">
                                    {t('side_panel.areas_section.areas')}
                                </SelectItem>
                                <SelectItem value="visuals">
                                    {t('side_panel.visuals_section.visuals')}
                                </SelectItem>
                                {supportsCustomTypes(databaseType) ? (
                                    <SelectItem value="customTypes">
                                        {t(
                                            'side_panel.custom_types_section.custom_types'
                                        )}
                                    </SelectItem>
                                ) : null}
                                {showStandardCommentsEntry ? (
                                    <SelectItem value="comments">
                                        {t('side_panel.comments_section.title')}
                                    </SelectItem>
                                ) : null}
                                {showLegacyCommentsEntry ? (
                                    <SelectItem value="comments">
                                        {t(
                                            'side_panel.legacy_comments_section.title'
                                        )}
                                    </SelectItem>
                                ) : null}
                                {conversationsAvailable ? (
                                    <SelectItem value="conversations">
                                        {t(
                                            'side_panel.conversations_section.title'
                                        )}
                                    </SelectItem>
                                ) : null}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            ) : null}
            {selectedSidebarSection === 'tables' ? (
                <TablesSection />
            ) : selectedSidebarSection === 'dbml' ? (
                <Suspense
                    fallback={
                        <div className="flex flex-1 items-center justify-center">
                            <Spinner />
                        </div>
                    }
                >
                    <DBMLSectionLazy />
                </Suspense>
            ) : selectedSidebarSection === 'refs' ? (
                <RefsSection />
            ) : selectedSidebarSection === 'visuals' ? (
                <VisualsSection />
            ) : selectedSidebarSection === 'comments' ? (
                <CommentsSection />
            ) : selectedSidebarSection === 'conversations' ? (
                <ConversationsSection />
            ) : (
                <CustomTypesSection />
            )}
        </aside>
    );
};
