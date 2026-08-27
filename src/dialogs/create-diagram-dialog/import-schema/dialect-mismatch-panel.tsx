import React from 'react';
import { Button } from '@/components/button/button';
import { databaseTypeToLabelMap } from '@/lib/databases';
import type { DatabaseType } from '@/lib/domain/database-type';
import { useTranslation } from 'react-i18next';

export interface DialectMismatchPanelProps {
    selectedDatabaseType: DatabaseType;
    detectedDatabaseType: DatabaseType;
    onSwitchDatabase: () => void;
    onBack: () => void;
}

export const DialectMismatchPanel: React.FC<DialectMismatchPanelProps> = ({
    selectedDatabaseType,
    detectedDatabaseType,
    onSwitchDatabase,
    onBack,
}) => {
    const { t } = useTranslation();

    return (
        <div
            role="region"
            aria-labelledby="dialect-mismatch-title"
            className="flex flex-col gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm"
        >
            <p id="dialect-mismatch-title" className="font-medium">
                {t('new_diagram_dialog.import_schema.mismatch.title', {
                    detected: databaseTypeToLabelMap[detectedDatabaseType],
                    selected: databaseTypeToLabelMap[selectedDatabaseType],
                })}
            </p>
            <p className="text-muted-foreground">
                {t('new_diagram_dialog.import_schema.mismatch.description')}
            </p>
            <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onSwitchDatabase}>
                    {t('new_diagram_dialog.import_schema.mismatch.switch', {
                        database: databaseTypeToLabelMap[detectedDatabaseType],
                    })}
                </Button>
                <Button type="button" variant="secondary" onClick={onBack}>
                    {t('new_diagram_dialog.import_schema.mismatch.go_back')}
                </Button>
            </div>
        </div>
    );
};
