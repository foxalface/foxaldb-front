import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { databaseTypeToLabelMap, getDatabaseLogo } from '@/lib/databases';
import type { DatabaseType } from '@/lib/domain/database-type';
import { ExportTargetButton } from '../export-target-button';

interface ExportSqlTargetStepProps {
    sourceDatabaseType: DatabaseType;
    targets: DatabaseType[];
    onSelectTarget: (targetDatabaseType: DatabaseType) => void;
}

export const ExportSqlTargetStep: React.FC<ExportSqlTargetStepProps> = ({
    sourceDatabaseType,
    targets,
    onSelectTarget,
}) => {
    const { t } = useTranslation();
    const { effectiveTheme } = useTheme();
    const sourceLabel = databaseTypeToLabelMap[sourceDatabaseType];

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
                {t('export_wizard.sql.target_step.source_label', {
                    database: sourceLabel,
                })}
            </p>
            <div className="flex flex-col gap-2">
                {targets.map((targetDatabaseType) => {
                    const targetLabel =
                        databaseTypeToLabelMap[targetDatabaseType];
                    const logo = getDatabaseLogo(
                        targetDatabaseType,
                        effectiveTheme
                    );
                    const isCrossDialect =
                        targetDatabaseType !== sourceDatabaseType;

                    return (
                        <ExportTargetButton
                            key={targetDatabaseType}
                            icon={
                                logo ? (
                                    <img
                                        src={logo}
                                        alt=""
                                        className="size-5 object-contain"
                                    />
                                ) : null
                            }
                            title={targetLabel}
                            description={
                                isCrossDialect
                                    ? t(
                                          'export_wizard.sql.target_step.cross_dialect_description',
                                          {
                                              source: sourceLabel,
                                              target: targetLabel,
                                          }
                                      )
                                    : t(
                                          'export_wizard.sql.target_step.same_dialect_description',
                                          {
                                              database: targetLabel,
                                          }
                                      )
                            }
                            onClick={() => onSelectTarget(targetDatabaseType)}
                        />
                    );
                })}
            </div>
        </div>
    );
};
