import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs/tabs';
import {
    sidePanelSectionTabListClassName,
    sidePanelSectionTabTriggerClassName,
} from '@/components/side-panel-section-tabs/side-panel-section-tabs';
import type { DbmlRefFormat } from './dbml-ref-format';

interface DbmlRefFormatToggleProps {
    value: DbmlRefFormat;
    onValueChange: (value: DbmlRefFormat) => void;
    disabled?: boolean;
}

export const DbmlRefFormatToggle: React.FC<DbmlRefFormatToggleProps> = ({
    value,
    onValueChange,
    disabled = false,
}) => {
    const { t } = useTranslation();

    const handleValueChange = useCallback(
        (next: string) => {
            if (next === 'inline' || next === 'standard') {
                onValueChange(next);
            }
        },
        [onValueChange]
    );

    return (
        <Tabs
            value={value}
            onValueChange={handleValueChange}
            data-testid="dbml-ref-format-toggle"
        >
            <TabsList
                className={sidePanelSectionTabListClassName}
                aria-label={t('dbml.ref_format.label')}
            >
                <TabsTrigger
                    value="standard"
                    className={sidePanelSectionTabTriggerClassName}
                    disabled={disabled}
                    data-testid="dbml-ref-format-standard"
                >
                    {t('dbml.ref_format.standard')}
                </TabsTrigger>
                <TabsTrigger
                    value="inline"
                    className={sidePanelSectionTabTriggerClassName}
                    disabled={disabled}
                    data-testid="dbml-ref-format-inline"
                >
                    {t('dbml.ref_format.inline')}
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
};
