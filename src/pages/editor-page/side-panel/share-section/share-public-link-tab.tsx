import React from 'react';
import { Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SidePanelEmptyState } from '@/components/side-panel-empty-state/side-panel-empty-state';

export interface SharePublicLinkTabProps {}

export const SharePublicLinkTab: React.FC<SharePublicLinkTabProps> = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center">
            <SidePanelEmptyState
                icon={
                    <Link2
                        className="size-12"
                        strokeWidth={1.25}
                        aria-hidden="true"
                    />
                }
                title={t('side_panel.share_section.public_link.title')}
                description={t(
                    'side_panel.share_section.public_link.description'
                )}
                className="mt-12"
            />
            <p className="px-4 text-center text-xs text-muted-foreground">
                {t('side_panel.share_section.public_link.coming_soon')}
            </p>
        </div>
    );
};
