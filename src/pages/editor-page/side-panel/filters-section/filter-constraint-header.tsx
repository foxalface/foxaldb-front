import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import {
    sidePanelFilterClearButtonClassName,
    sidePanelFilterClearButtonIcon,
} from '@/components/side-panel-empty-state/side-panel-filter-clear-action';

export const FilterConstraintHeader: React.FC<{
    summary: string;
    showClear: boolean;
    onClear: () => void;
}> = ({ summary, showClear, onClear }) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-start justify-between gap-2 py-1">
            <p className="text-xs text-muted-foreground">{summary}</p>
            {showClear ? (
                <Button
                    type="button"
                    variant="outline"
                    className={sidePanelFilterClearButtonClassName}
                    onClick={onClear}
                >
                    {sidePanelFilterClearButtonIcon}
                    {t('side_panel.filters_section.clear')}
                </Button>
            ) : null}
        </div>
    );
};
