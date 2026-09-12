import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { cn } from '@/lib/utils';
import type { PrismaExportVersion } from '@/lib/api/prisma-export-types';

interface ExportPrismaVersionStepProps {
    selectedVersion: PrismaExportVersion;
    onSelectVersion: (version: PrismaExportVersion) => void;
    onContinue: () => void;
}

interface VersionOptionProps {
    version: PrismaExportVersion;
    title: string;
    description?: string;
    selected: boolean;
    onSelect: () => void;
}

const VersionOption: React.FC<VersionOptionProps> = ({
    version,
    title,
    description,
    selected,
    onSelect,
}) => (
    <button
        type="button"
        className={cn(
            'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
            selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
        )}
        onClick={onSelect}
        data-testid={`prisma-version-${version}`}
    >
        <span className="min-w-0">
            <span className="block font-medium leading-snug">{title}</span>
            {description ? (
                <span className="block text-sm text-muted-foreground">
                    {description}
                </span>
            ) : null}
        </span>
    </button>
);

export const ExportPrismaVersionStep: React.FC<
    ExportPrismaVersionStepProps
> = ({ selectedVersion, onSelectVersion, onContinue }) => {
    const { t } = useTranslation();

    return (
        <div
            className="flex flex-col gap-4"
            data-testid="export-prisma-version-step"
        >
            <p className="text-sm text-muted-foreground">
                {t('export_wizard.prisma.version_step.description')}
            </p>

            <div className="flex flex-col gap-2">
                <VersionOption
                    version="7"
                    title={t('export_wizard.prisma.version_step.prisma_7')}
                    description={t(
                        'export_wizard.prisma.version_step.prisma_7_recommended'
                    )}
                    selected={selectedVersion === '7'}
                    onSelect={() => onSelectVersion('7')}
                />
                <VersionOption
                    version="6"
                    title={t('export_wizard.prisma.version_step.prisma_6')}
                    selected={selectedVersion === '6'}
                    onSelect={() => onSelectVersion('6')}
                />
            </div>

            <Button
                type="button"
                className="w-fit"
                onClick={onContinue}
                data-testid="prisma-version-continue"
            >
                {t('export_wizard.prisma.version_step.continue')}
            </Button>
        </div>
    );
};
