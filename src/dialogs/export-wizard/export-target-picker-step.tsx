import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DatabaseType } from '@/lib/domain/database-type';
import type { ExportTargetId } from './export-target-id';
import { ExportTargetButton } from './export-target-button';
import {
    EXPORT_TARGET_SECTIONS,
    EXPORT_TARGET_SECTION_LABEL_KEYS,
    resolveVisibleExportTargetsBySection,
    type ResolvedExportTarget,
} from './export-target-registry';
import type { ExportAvailabilityContext } from './export-target-availability';

interface ExportTargetPickerStepProps {
    availabilityContext: ExportAvailabilityContext;
    databaseType: DatabaseType;
    onSelectTarget: (targetId: ExportTargetId) => void;
}

const getTargetDescription = (
    target: ResolvedExportTarget,
    t: (key: string) => string,
    databaseType: DatabaseType
): string => {
    if (
        target.availability.status === 'disabled' &&
        target.availability.reasonKey
    ) {
        return t(target.availability.reasonKey);
    }

    if (target.id === 'sql' && databaseType === DatabaseType.GENERIC) {
        return t('export_wizard.targets.sql.description_generic');
    }

    return t(target.descriptionKey);
};

export const ExportTargetPickerStep: React.FC<ExportTargetPickerStepProps> = ({
    availabilityContext,
    databaseType,
    onSelectTarget,
}) => {
    const { t } = useTranslation();

    const sections = useMemo(
        () =>
            EXPORT_TARGET_SECTIONS.map((section) => ({
                section,
                targets: resolveVisibleExportTargetsBySection(
                    section,
                    availabilityContext
                ),
            })).filter(({ targets }) => targets.length > 0),
        [availabilityContext]
    );

    return (
        <div className="flex flex-col gap-4">
            {sections.map(({ section, targets }) => (
                <section key={section} className="flex flex-col gap-2">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t(EXPORT_TARGET_SECTION_LABEL_KEYS[section])}
                    </h3>
                    <div className="flex flex-col gap-2">
                        {targets.map((target) => (
                            <ExportTargetButton
                                key={target.id}
                                icon={<target.icon className="size-5" />}
                                title={t(target.titleKey)}
                                description={getTargetDescription(
                                    target,
                                    t,
                                    databaseType
                                )}
                                disabled={
                                    target.availability.status === 'disabled'
                                }
                                onClick={() => onSelectTarget(target.id)}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};
