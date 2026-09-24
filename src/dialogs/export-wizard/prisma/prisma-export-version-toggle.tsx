import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs/tabs';
import {
    sidePanelSectionTabListClassName,
    sidePanelSectionTabTriggerClassName,
} from '@/components/side-panel-section-tabs/side-panel-section-tabs';
import type { PrismaExportVersion } from '@/lib/api/prisma-export-types';

const PRISMA_VERSION_OPTIONS: PrismaExportVersion[] = ['7', '6'];

interface PrismaExportVersionToggleProps {
    value: PrismaExportVersion;
    onValueChange: (version: PrismaExportVersion) => void;
    disabled?: boolean;
}

const VERSION_LABEL_KEYS: Record<
    PrismaExportVersion,
    | 'export_wizard.prisma.version_step.prisma_7'
    | 'export_wizard.prisma.version_step.prisma_6'
> = {
    '7': 'export_wizard.prisma.version_step.prisma_7',
    '6': 'export_wizard.prisma.version_step.prisma_6',
};

export const PrismaExportVersionToggle: React.FC<
    PrismaExportVersionToggleProps
> = ({ value, onValueChange, disabled = false }) => {
    const { t } = useTranslation();

    const handleValueChange = useCallback(
        (next: string) => {
            if (next === '6' || next === '7') {
                onValueChange(next);
            }
        },
        [onValueChange]
    );

    return (
        <Tabs
            value={value}
            onValueChange={handleValueChange}
            data-testid="prisma-export-version-toggle"
        >
            <TabsList
                className={sidePanelSectionTabListClassName}
                aria-label={t('export_wizard.prisma.version_step.title')}
            >
                {PRISMA_VERSION_OPTIONS.map((version) => (
                    <TabsTrigger
                        key={version}
                        value={version}
                        className={sidePanelSectionTabTriggerClassName}
                        disabled={disabled}
                        data-testid={`prisma-version-${version}`}
                    >
                        {t(VERSION_LABEL_KEYS[version])}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};
