import React from 'react';
import { useTranslation } from 'react-i18next';
import { Archive } from 'lucide-react';

export const ConversationArchiveBanner: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div
            role="status"
            className="mb-2 flex shrink-0 items-start gap-2 rounded-md border border-muted bg-muted/40 px-3 py-2"
            data-testid="conversation-archive-banner"
        >
            <Archive
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">
                    {t(
                        'side_panel.conversations_section.detail.archive_banner.title'
                    )}
                </p>
                <p className="text-xs text-muted-foreground">
                    {t(
                        'side_panel.conversations_section.detail.archive_banner.description'
                    )}
                </p>
            </div>
        </div>
    );
};
