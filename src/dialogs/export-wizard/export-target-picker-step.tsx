import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ConversationMessageDaySeparator } from '@/components/conversation-message/conversation-message-day-separator';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { DatabaseType } from '@/lib/domain/database-type';
import { ProjectFrameworkIcon } from '@/lib/project-import/project-framework-icon';
import type { ExportTargetId } from './export-target-id';
import { ExportTargetTile } from './export-target-tile';
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

const EXPORT_TARGET_GRID_CLASS =
    'grid w-full grid-flow-row grid-cols-6 content-start gap-3';

const EXPORT_TARGET_ICON_CLASS = 'size-8';

const renderTargetIcon = (target: ResolvedExportTarget): React.ReactNode => {
    if (target.framework) {
        return (
            <ProjectFrameworkIcon
                framework={target.framework}
                className={EXPORT_TARGET_ICON_CLASS}
            />
        );
    }

    const Icon = target.icon;
    return Icon ? <Icon className={EXPORT_TARGET_ICON_CLASS} /> : null;
};

const getDisabledTargetReason = (
    target: ResolvedExportTarget,
    t: (key: string, options?: Record<string, string>) => string
): string | undefined => {
    if (
        target.availability.status !== 'disabled' ||
        !target.availability.reasonKey
    ) {
        return undefined;
    }

    return t('export_wizard.targets.unsupported_framework', {
        framework: t(target.titleKey),
    });
};

const getTargetDescription = (
    target: ResolvedExportTarget,
    t: (key: string, options?: Record<string, string>) => string,
    databaseType: DatabaseType
): string => {
    const disabledReason = getDisabledTargetReason(target, t);

    if (disabledReason) {
        return disabledReason;
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
        <TooltipProvider>
            <div
                className="mx-auto flex w-full max-w-md flex-col items-stretch gap-5"
                data-testid="export-target-picker"
            >
                {sections.map(({ section, targets }) => (
                    <section
                        key={section}
                        className="flex w-full flex-col gap-2"
                    >
                        <ConversationMessageDaySeparator
                            label={t(EXPORT_TARGET_SECTION_LABEL_KEYS[section])}
                        />
                        <div className={EXPORT_TARGET_GRID_CLASS}>
                            {targets.map((target) => {
                                const isDisabled =
                                    target.availability.status === 'disabled';
                                const disabledReason = getDisabledTargetReason(
                                    target,
                                    t
                                );

                                return (
                                    <ExportTargetTile
                                        key={target.id}
                                        icon={renderTargetIcon(target)}
                                        title={t(target.titleKey)}
                                        description={getTargetDescription(
                                            target,
                                            t,
                                            databaseType
                                        )}
                                        disabled={isDisabled}
                                        disabledReason={disabledReason}
                                        onClick={() =>
                                            onSelectTarget(target.id)
                                        }
                                    />
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </TooltipProvider>
    );
};
