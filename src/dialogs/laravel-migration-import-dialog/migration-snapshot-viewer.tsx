import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { LaravelMigrationSchemaSnapshot } from '@/types/laravel-migration';

export interface MigrationSnapshotViewerProps {
    snapshot: LaravelMigrationSchemaSnapshot;
}

// TODO: This viewer is intentionally reusable for future import preview, diff preview, and apply preview flows.

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
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <SummaryItem
                    label={t('import_laravel_migrations_dialog.summary.tables')}
                    value={summary.tables}
                />
                <SummaryItem
                    label={t(
                        'import_laravel_migrations_dialog.summary.columns'
                    )}
                    value={summary.columns}
                />
                <SummaryItem
                    label={t(
                        'import_laravel_migrations_dialog.summary.indexes'
                    )}
                    value={summary.indexes}
                />
                <SummaryItem
                    label={t(
                        'import_laravel_migrations_dialog.summary.foreign_keys'
                    )}
                    value={summary.foreignKeys}
                />
                <SummaryItem
                    label={t(
                        'import_laravel_migrations_dialog.summary.warnings'
                    )}
                    value={summary.warnings}
                />
            </div>

            <section className="space-y-2">
                <h3 className="text-sm font-medium">
                    {t('import_laravel_migrations_dialog.tables.title')}
                </h3>
                {snapshot.tables.length === 0 ? (
                    <p className="text-sm text-muted-foreground">—</p>
                ) : (
                    <ul className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                        {snapshot.tables.map((table) => (
                            <li key={table.name}>
                                <details>
                                    <summary className="cursor-pointer text-sm">
                                        <span className="font-medium">
                                            {table.name}
                                        </span>
                                        <span className="ml-2 text-muted-foreground">
                                            {t(
                                                'import_laravel_migrations_dialog.tables.columns_count',
                                                { count: table.columns.length }
                                            )}
                                            {' · '}
                                            {t(
                                                'import_laravel_migrations_dialog.tables.indexes_count',
                                                { count: table.indexes.length }
                                            )}
                                        </span>
                                    </summary>
                                    {table.columns.length > 0 ? (
                                        <ul className="mt-1 space-y-0.5 pl-4 text-xs text-muted-foreground">
                                            {table.columns.map((column) => (
                                                <li key={column.name}>
                                                    {column.name}{' '}
                                                    <span className="opacity-80">
                                                        ({column.type})
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </details>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="space-y-2">
                <h3 className="text-sm font-medium">
                    {t('import_laravel_migrations_dialog.foreign_keys.title')}
                </h3>
                {snapshot.foreignKeys.length === 0 ? (
                    <p className="text-sm text-muted-foreground">—</p>
                ) : (
                    <ul className="max-h-36 space-y-1 overflow-y-auto rounded-md border p-2 text-sm">
                        {snapshot.foreignKeys.map((foreignKey, index) => (
                            <li
                                key={`${foreignKey.localTable}.${foreignKey.localColumn}-${index}`}
                            >
                                {foreignKey.localTable}.{foreignKey.localColumn}
                                {' → '}
                                {foreignKey.referencedTable}.
                                {foreignKey.referencedColumn}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="space-y-2">
                <h3 className="text-sm font-medium">
                    {t('import_laravel_migrations_dialog.warnings.title')}
                </h3>
                {snapshot.warnings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t('import_laravel_migrations_dialog.warnings.none')}
                    </p>
                ) : (
                    <ul className="max-h-36 space-y-1 overflow-y-auto rounded-md border p-2 text-sm">
                        {snapshot.warnings.map((warning, index) => (
                            <li key={`${warning.message}-${index}`}>
                                {warning.message}
                                {warning.relativePath ? (
                                    <span className="ml-1 text-muted-foreground">
                                        ({warning.relativePath})
                                    </span>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="space-y-2">
                <h3 className="text-sm font-medium">
                    {t('import_laravel_migrations_dialog.source_files.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {summary.sourceFiles}
                </p>
                {snapshot.sourceFiles.length > 0 ? (
                    <ul className="max-h-24 space-y-0.5 overflow-y-auto rounded-md border p-2 text-xs text-muted-foreground">
                        {snapshot.sourceFiles.map((sourceFile) => (
                            <li key={sourceFile}>{sourceFile}</li>
                        ))}
                    </ul>
                ) : null}
            </section>
        </div>
    );
};

interface SummaryItemProps {
    label: string;
    value: number;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ label, value }) => (
    <div className="rounded-md border px-3 py-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
    </div>
);
