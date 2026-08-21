import React, { useState } from 'react';
import { Share2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/tabs/tabs';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import { Spinner } from '@/components/spinner/spinner';
import { Button } from '@/components/button/button';
import {
    SidePanelSectionTabsList,
    SidePanelSectionTabsToolbar,
    SidePanelSectionTabsTrigger,
} from '@/components/side-panel-section-tabs/side-panel-section-tabs';
import { useAuth } from '@/hooks/use-auth';
import { useSharePanel } from './use-share-panel';
import { ShareCollaboratorsTab } from './share-collaborators-tab';
import { SharePublicLinkTab } from './share-public-link-tab';

export interface ShareSectionProps {}

export const ShareSection: React.FC<ShareSectionProps> = () => {
    const { t } = useTranslation();
    const { diagramId } = useParams<{ diagramId: string }>();
    const { user } = useAuth();
    const [selectedTab, setSelectedTab] = useState<
        'collaborators' | 'public_link'
    >('collaborators');
    const {
        members,
        status,
        isRetrying,
        handleRetry,
        handleMemberAdded,
        handleMembersChange,
    } = useSharePanel(diagramId);

    const isInitialLoading = status === 'loading' || status === 'idle';
    const isLoadError = status === 'error';

    if (!user || diagramId === undefined) {
        return null;
    }

    return (
        <section
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
            aria-label={t('side_panel.share_section.title')}
            data-vaul-no-drag
        >
            <Tabs
                value={selectedTab}
                onValueChange={(value) => {
                    setSelectedTab(value as 'collaborators' | 'public_link');
                }}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
                <SidePanelSectionTabsToolbar>
                    <SidePanelSectionTabsList
                        aria-label={t('side_panel.share_section.tabs_label')}
                    >
                        <SidePanelSectionTabsTrigger value="collaborators">
                            <Users className="size-3.5" aria-hidden="true" />
                            {t('side_panel.share_section.tabs.collaborators')}
                        </SidePanelSectionTabsTrigger>
                        <SidePanelSectionTabsTrigger value="public_link">
                            <Share2 className="size-3.5" aria-hidden="true" />
                            {t('side_panel.share_section.tabs.public_link')}
                        </SidePanelSectionTabsTrigger>
                    </SidePanelSectionTabsList>
                </SidePanelSectionTabsToolbar>

                <TabsContent
                    value="collaborators"
                    className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2">
                        {isInitialLoading ? (
                            <div
                                className="flex flex-1 flex-col items-center justify-center gap-2 py-8"
                                aria-busy="true"
                                role="status"
                            >
                                <Spinner size="small" />
                                <span className="text-sm text-muted-foreground">
                                    {t('side_panel.share_section.loading')}
                                </span>
                            </div>
                        ) : isLoadError ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'side_panel.share_section.errors.load_failed'
                                    )}
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRetry}
                                    disabled={isRetrying}
                                >
                                    {t('side_panel.share_section.retry')}
                                </Button>
                            </div>
                        ) : (
                            <ScrollArea className="h-full">
                                <ShareCollaboratorsTab
                                    diagramId={diagramId}
                                    members={members}
                                    onMembersChange={handleMembersChange}
                                    onMemberAdded={handleMemberAdded}
                                />
                            </ScrollArea>
                        )}
                    </div>
                </TabsContent>

                <TabsContent
                    value="public_link"
                    className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2">
                        <ScrollArea className="h-full">
                            <SharePublicLinkTab />
                        </ScrollArea>
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    );
};
