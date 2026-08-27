import React from 'react';
import { ToggleGroup } from '@/components/toggle/toggle-group';
import { DatabaseOption } from '@/dialogs/create-diagram-dialog/select-database/database-option';
import { databaseTypeToLabelMap } from '@/lib/databases';
import type { DatabaseType } from '@/lib/domain/database-type';
import { useTranslation } from 'react-i18next';

export type DialectResolutionVariant = 'create' | 'existing';

export interface DialectResolutionPanelProps {
    variant?: DialectResolutionVariant;
    selectedDatabaseType: DatabaseType;
    candidates: DatabaseType[];
    resolvedSourceDialect: DatabaseType | null;
    onResolve: (databaseType: DatabaseType) => void;
}

export const DialectResolutionPanel: React.FC<DialectResolutionPanelProps> = ({
    variant = 'create',
    selectedDatabaseType,
    candidates,
    resolvedSourceDialect,
    onResolve,
}) => {
    const { t } = useTranslation();

    if (candidates.length === 0) {
        return null;
    }

    const descriptionKey =
        variant === 'existing'
            ? 'import_database_dialog.import_schema.ambiguous.description'
            : 'new_diagram_dialog.import_schema.ambiguous.description';

    return (
        <div
            role="region"
            aria-labelledby="dialect-resolution-title"
            className="flex flex-col gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm"
        >
            <div className="flex flex-col gap-1">
                <p id="dialect-resolution-title" className="font-medium">
                    {t('new_diagram_dialog.import_schema.ambiguous.title')}
                </p>
                <p className="text-muted-foreground">
                    {t(descriptionKey, {
                        selected: databaseTypeToLabelMap[selectedDatabaseType],
                    })}
                </p>
            </div>
            <ToggleGroup
                type="single"
                value={resolvedSourceDialect ?? selectedDatabaseType}
                onValueChange={(value) => {
                    if (value) {
                        onResolve(value as DatabaseType);
                    }
                }}
                className="grid grid-cols-3 gap-3"
                aria-label={t(
                    'new_diagram_dialog.import_schema.ambiguous.choose_source'
                )}
            >
                {candidates.map((candidate) => (
                    <DatabaseOption key={candidate} type={candidate} />
                ))}
            </ToggleGroup>
        </div>
    );
};
