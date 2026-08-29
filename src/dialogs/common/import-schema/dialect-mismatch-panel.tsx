import React from 'react';
import { Button } from '@/components/button/button';
import { databaseTypeToLabelMap } from '@/lib/databases';
import type { DatabaseType } from '@/lib/domain/database-type';
import { useTranslation } from 'react-i18next';

export type DialectMismatchVariant = 'create' | 'existing';

export interface DialectMismatchPanelProps {
    variant: DialectMismatchVariant;
    selectedDatabaseType: DatabaseType;
    detectedDatabaseType: DatabaseType;
    onSwitchDatabase?: () => void;
}

export const DialectMismatchPanel: React.FC<DialectMismatchPanelProps> = ({
    variant,
    selectedDatabaseType,
    detectedDatabaseType,
    onSwitchDatabase,
}) => {
    const { t } = useTranslation();

    const titleKey =
        variant === 'existing'
            ? 'import_database_dialog.import_schema.mismatch.title'
            : 'new_diagram_dialog.import_schema.mismatch.title';
    const descriptionKey =
        variant === 'existing'
            ? 'import_database_dialog.import_schema.mismatch.description'
            : 'new_diagram_dialog.import_schema.mismatch.description';

    return (
        <div
            role="region"
            aria-labelledby="dialect-mismatch-title"
            className="flex flex-col gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm"
        >
            <p id="dialect-mismatch-title" className="font-medium">
                {t(titleKey, {
                    detected: databaseTypeToLabelMap[detectedDatabaseType],
                    selected: databaseTypeToLabelMap[selectedDatabaseType],
                })}
            </p>
            <p className="text-muted-foreground">{t(descriptionKey)}</p>
            {variant === 'create' && onSwitchDatabase ? (
                <div className="flex justify-center">
                    <Button type="button" onClick={onSwitchDatabase}>
                        {t('new_diagram_dialog.import_schema.mismatch.switch', {
                            database:
                                databaseTypeToLabelMap[detectedDatabaseType],
                        })}
                    </Button>
                </div>
            ) : null}
        </div>
    );
};
