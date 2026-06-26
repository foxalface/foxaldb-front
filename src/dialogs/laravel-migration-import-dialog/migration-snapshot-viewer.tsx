import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ForeignKeyList,
    ImportTableSnapshotList,
    MigrationEmptyDash,
    MigrationSummaryGrid,
    MigrationSummaryItem,
    MigrationViewerLayout,
    MigrationViewerSection,
    MigrationScrollableList,
    WarningList,
} from '@/dialogs/laravel-migration-shared/viewer-primitives';
import type { LaravelMigrationSchemaSnapshot } from '@/types/laravel-migration';

export interface MigrationSnapshotViewerProps {
    snapshot: LaravelMigrationSchemaSnapshot;
}

export const MigrationSnapshotViewer: React.FC<
    MigrationSnapshotViewerProps
> = ({ snapshot }) => {
    const { t } = useTranslation();

    const summary = useMemo(() => {
        const columnCount = snapshot.tables.reduce(
            (total, table) => total + table.columns.length,
            0
        );
        const indexCount = snapshot.tables.reduce(
            (total, table) => total + table.indexes.length,
            0
        );

        return {
            tables: snapshot.tables.length,
            columns: columnCount,
            indexes: indexCount,
            foreignKeys: snapshot.foreignKeys.length,
            warnings: snapshot.warnings.length,
            sourceFiles: snapshot.sourceFiles.length,
        };
    }, [snapshot]);

    return (
        <MigrationViewerLayout>
            <MigrationSummaryGrid>
                <MigrationSummaryItem
                    label={t('import_laravel_migrations_dialog.summary.tables')}
                    value={summary.tables}
                />
                <MigrationSummaryItem
                    label={t(
                        'import_laravel_migrations_dialog.summary.columns'
                    )}
                    value={summary.columns}
                />
                <MigrationSummaryItem
                    label={t(
                        'import_laravel_migrations_dialog.summary.indexes'
                    )}
                    value={summary.indexes}
                />
                <MigrationSummaryItem
                    label={t(
                        'import_laravel_migrations_dialog.summary.foreign_keys'
                    )}
                    value={summary.foreignKeys}
                />
                <MigrationSummaryItem
                    label={t(
                        'import_laravel_migrations_dialog.summary.warnings'
                    )}
                    value={summary.warnings}
                />
            </MigrationSummaryGrid>

            <MigrationViewerSection
                title={t('import_laravel_migrations_dialog.tables.title')}
            >
                {snapshot.tables.length === 0 ? (
                    <MigrationEmptyDash />
                ) : (
                    <ImportTableSnapshotList tables={snapshot.tables} />
                )}
            </MigrationViewerSection>

            <MigrationViewerSection
                title={t('import_laravel_migrations_dialog.foreign_keys.title')}
            >
                {snapshot.foreignKeys.length === 0 ? (
                    <MigrationEmptyDash />
                ) : (
                    <ForeignKeyList foreignKeys={snapshot.foreignKeys} />
                )}
            </MigrationViewerSection>

            <MigrationViewerSection
                title={t('import_laravel_migrations_dialog.warnings.title')}
            >
                <WarningList
                    warnings={snapshot.warnings}
                    noneLabel={t(
                        'import_laravel_migrations_dialog.warnings.none'
                    )}
                />
            </MigrationViewerSection>

            <MigrationViewerSection
                title={t('import_laravel_migrations_dialog.source_files.title')}
            >
                <p className="text-sm text-muted-foreground">
                    {summary.sourceFiles}
                </p>
                {snapshot.sourceFiles.length > 0 ? (
                    <MigrationScrollableList size="sm" textSize="xs">
                        {snapshot.sourceFiles.map((sourceFile) => (
                            <li key={sourceFile}>{sourceFile}</li>
                        ))}
                    </MigrationScrollableList>
                ) : null}
            </MigrationViewerSection>
        </MigrationViewerLayout>
    );
};
