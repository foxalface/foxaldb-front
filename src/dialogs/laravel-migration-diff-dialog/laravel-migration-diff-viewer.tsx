import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatAttributeValue } from '@/dialogs/laravel-migration-shared/format-attribute-value';
import {
    ForeignKeyList,
    MigrationEmptyDash,
    MigrationScrollableList,
    MigrationSummaryGrid,
    MigrationSummaryItem,
    MigrationViewerLayout,
    MigrationViewerSection,
    TableSnapshotList,
    WarningList,
} from '@/dialogs/laravel-migration-shared/viewer-primitives';
import { formatForeignKeyLabel } from '@/dialogs/laravel-migration-shared/viewer-utils';
import type {
    AttributeChange,
    ColumnSnapshot,
    ForeignKeyDiff,
    IndexDiff,
    IndexSnapshot,
    LaravelMigrationSchemaDiff,
    TableDiff,
} from '@/types/laravel-migration';

export interface LaravelMigrationDiffViewerProps {
    diff: LaravelMigrationSchemaDiff;
    footer?: React.ReactNode;
}

export const LaravelMigrationDiffViewer: React.FC<
    LaravelMigrationDiffViewerProps
> = ({ diff, footer }) => {
    const { t } = useTranslation();

    const summary = useMemo(
        () => ({
            addedTables: diff.addedTables.length,
            removedTables: diff.removedTables.length,
            changedTables: diff.changedTables.length,
            addedForeignKeys: diff.addedForeignKeys.length,
            removedForeignKeys: diff.removedForeignKeys.length,
            changedForeignKeys: diff.changedForeignKeys.length,
            warnings: diff.warnings.length,
        }),
        [diff]
    );

    return (
        <MigrationViewerLayout footer={footer}>
            <MigrationSummaryGrid>
                <MigrationSummaryItem
                    label={t(
                        'compare_laravel_migrations_dialog.summary.added_tables'
                    )}
                    value={summary.addedTables}
                />
                <MigrationSummaryItem
                    label={t(
                        'compare_laravel_migrations_dialog.summary.removed_tables'
                    )}
                    value={summary.removedTables}
                />
                <MigrationSummaryItem
                    label={t(
                        'compare_laravel_migrations_dialog.summary.changed_tables'
                    )}
                    value={summary.changedTables}
                />
                <MigrationSummaryItem
                    label={t(
                        'compare_laravel_migrations_dialog.summary.added_foreign_keys'
                    )}
                    value={summary.addedForeignKeys}
                />
                <MigrationSummaryItem
                    label={t(
                        'compare_laravel_migrations_dialog.summary.removed_foreign_keys'
                    )}
                    value={summary.removedForeignKeys}
                />
                <MigrationSummaryItem
                    label={t(
                        'compare_laravel_migrations_dialog.summary.changed_foreign_keys'
                    )}
                    value={summary.changedForeignKeys}
                />
                <MigrationSummaryItem
                    label={t(
                        'compare_laravel_migrations_dialog.summary.warnings'
                    )}
                    value={summary.warnings}
                />
            </MigrationSummaryGrid>

            <MigrationViewerSection
                title={t(
                    'compare_laravel_migrations_dialog.sections.added_tables'
                )}
            >
                {diff.addedTables.length === 0 ? (
                    <MigrationEmptyDash />
                ) : (
                    <TableSnapshotList
                        tables={diff.addedTables}
                        columnsCountLabel={(count) =>
                            t(
                                'compare_laravel_migrations_dialog.tables.columns_count',
                                { count }
                            )
                        }
                        indexesCountLabel={(count) =>
                            t(
                                'compare_laravel_migrations_dialog.tables.indexes_count',
                                { count }
                            )
                        }
                    />
                )}
            </MigrationViewerSection>

            <MigrationViewerSection
                title={t(
                    'compare_laravel_migrations_dialog.sections.removed_tables'
                )}
            >
                {diff.removedTables.length === 0 ? (
                    <MigrationEmptyDash />
                ) : (
                    <TableSnapshotList
                        tables={diff.removedTables}
                        columnsCountLabel={(count) =>
                            t(
                                'compare_laravel_migrations_dialog.tables.columns_count',
                                { count }
                            )
                        }
                        indexesCountLabel={(count) =>
                            t(
                                'compare_laravel_migrations_dialog.tables.indexes_count',
                                { count }
                            )
                        }
                    />
                )}
            </MigrationViewerSection>

            <MigrationViewerSection
                title={t(
                    'compare_laravel_migrations_dialog.sections.changed_tables'
                )}
            >
                {diff.changedTables.length === 0 ? (
                    <MigrationEmptyDash />
                ) : (
                    <MigrationScrollableList size="lg">
                        {diff.changedTables.map((tableDiff) => (
                            <ChangedTableDiffItem
                                key={tableDiff.tableName}
                                tableDiff={tableDiff}
                            />
                        ))}
                    </MigrationScrollableList>
                )}
            </MigrationViewerSection>

            <MigrationViewerSection
                title={t(
                    'compare_laravel_migrations_dialog.sections.added_foreign_keys'
                )}
            >
                {diff.addedForeignKeys.length === 0 ? (
                    <MigrationEmptyDash />
                ) : (
                    <ForeignKeyList foreignKeys={diff.addedForeignKeys} />
                )}
            </MigrationViewerSection>

            <MigrationViewerSection
                title={t(
                    'compare_laravel_migrations_dialog.sections.removed_foreign_keys'
                )}
            >
                {diff.removedForeignKeys.length === 0 ? (
                    <MigrationEmptyDash />
                ) : (
                    <ForeignKeyList foreignKeys={diff.removedForeignKeys} />
                )}
            </MigrationViewerSection>

            <MigrationViewerSection
                title={t(
                    'compare_laravel_migrations_dialog.sections.changed_foreign_keys'
                )}
            >
                {diff.changedForeignKeys.length === 0 ? (
                    <MigrationEmptyDash />
                ) : (
                    <MigrationScrollableList>
                        {diff.changedForeignKeys.map((foreignKeyDiff) => (
                            <ChangedForeignKeyDiffItem
                                key={foreignKeyDiff.key}
                                foreignKeyDiff={foreignKeyDiff}
                            />
                        ))}
                    </MigrationScrollableList>
                )}
            </MigrationViewerSection>

            <MigrationViewerSection
                title={t('compare_laravel_migrations_dialog.sections.warnings')}
            >
                <WarningList
                    warnings={diff.warnings}
                    noneLabel={t(
                        'compare_laravel_migrations_dialog.warnings.none'
                    )}
                />
            </MigrationViewerSection>
        </MigrationViewerLayout>
    );
};

interface ChangedTableDiffItemProps {
    tableDiff: TableDiff;
}

const ChangedTableDiffItem: React.FC<ChangedTableDiffItemProps> = ({
    tableDiff,
}) => {
    const { t } = useTranslation();

    return (
        <li>
            <details>
                <summary className="cursor-pointer text-sm font-medium">
                    {tableDiff.tableName}
                </summary>
                <div className="mt-1 space-y-2 pl-4 text-xs">
                    {tableDiff.addedColumns.length > 0 ? (
                        <ColumnGroup
                            title={t(
                                'compare_laravel_migrations_dialog.changed_tables.added_columns'
                            )}
                            columns={tableDiff.addedColumns}
                        />
                    ) : null}
                    {tableDiff.removedColumns.length > 0 ? (
                        <ColumnGroup
                            title={t(
                                'compare_laravel_migrations_dialog.changed_tables.removed_columns'
                            )}
                            columns={tableDiff.removedColumns}
                        />
                    ) : null}
                    {tableDiff.changedColumns.length > 0 ? (
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">
                                {t(
                                    'compare_laravel_migrations_dialog.changed_tables.changed_columns'
                                )}
                            </p>
                            <ul className="space-y-1">
                                {tableDiff.changedColumns.map((columnDiff) => (
                                    <li key={columnDiff.columnName}>
                                        <p className="font-medium">
                                            {columnDiff.columnName}
                                        </p>
                                        <AttributeChangeList
                                            changes={columnDiff.changes}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    {tableDiff.addedIndexes.length > 0 ? (
                        <IndexGroup
                            title={t(
                                'compare_laravel_migrations_dialog.changed_tables.added_indexes'
                            )}
                            indexes={tableDiff.addedIndexes}
                        />
                    ) : null}
                    {tableDiff.removedIndexes.length > 0 ? (
                        <IndexGroup
                            title={t(
                                'compare_laravel_migrations_dialog.changed_tables.removed_indexes'
                            )}
                            indexes={tableDiff.removedIndexes}
                        />
                    ) : null}
                    {tableDiff.changedIndexes.length > 0 ? (
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">
                                {t(
                                    'compare_laravel_migrations_dialog.changed_tables.changed_indexes'
                                )}
                            </p>
                            <ul className="space-y-1">
                                {tableDiff.changedIndexes.map((indexDiff) => (
                                    <ChangedIndexDiffItem
                                        key={indexDiff.key}
                                        indexDiff={indexDiff}
                                    />
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            </details>
        </li>
    );
};

interface ColumnGroupProps {
    title: string;
    columns: ColumnSnapshot[];
}

const ColumnGroup: React.FC<ColumnGroupProps> = ({ title, columns }) => (
    <div className="space-y-1">
        <p className="font-medium text-muted-foreground">{title}</p>
        <ul className="space-y-0.5 text-muted-foreground">
            {columns.map((column) => (
                <li key={column.name}>
                    {column.name}{' '}
                    <span className="opacity-80">({column.type})</span>
                </li>
            ))}
        </ul>
    </div>
);

interface IndexGroupProps {
    title: string;
    indexes: IndexSnapshot[];
}

const IndexGroup: React.FC<IndexGroupProps> = ({ title, indexes }) => (
    <div className="space-y-1">
        <p className="font-medium text-muted-foreground">{title}</p>
        <ul className="space-y-0.5 text-muted-foreground">
            {indexes.map((index, indexPosition) => (
                <li key={`${index.name ?? 'index'}-${indexPosition}`}>
                    {index.columns.join(', ')}
                </li>
            ))}
        </ul>
    </div>
);

interface ChangedIndexDiffItemProps {
    indexDiff: IndexDiff;
}

const ChangedIndexDiffItem: React.FC<ChangedIndexDiffItemProps> = ({
    indexDiff,
}) => (
    <li>
        <p className="font-medium">{indexDiff.key}</p>
        <AttributeChangeList changes={indexDiff.changes} />
    </li>
);

interface ChangedForeignKeyDiffItemProps {
    foreignKeyDiff: ForeignKeyDiff;
}

const ChangedForeignKeyDiffItem: React.FC<ChangedForeignKeyDiffItemProps> = ({
    foreignKeyDiff,
}) => {
    const { t } = useTranslation();
    const label =
        foreignKeyDiff.after !== null
            ? formatForeignKeyLabel(foreignKeyDiff.after)
            : foreignKeyDiff.before !== null
              ? formatForeignKeyLabel(foreignKeyDiff.before)
              : foreignKeyDiff.key;

    return (
        <li>
            <p className="font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">
                {foreignKeyDiff.key}
            </p>
            <AttributeChangeList changes={foreignKeyDiff.changes} />
            {foreignKeyDiff.before !== null && foreignKeyDiff.after !== null ? (
                <p className="mt-1 text-xs text-muted-foreground">
                    {t(
                        'compare_laravel_migrations_dialog.changed_foreign_keys.before'
                    )}
                    : {formatForeignKeyLabel(foreignKeyDiff.before)}
                </p>
            ) : null}
        </li>
    );
};

interface AttributeChangeListProps {
    changes: AttributeChange[];
}

const AttributeChangeList: React.FC<AttributeChangeListProps> = ({
    changes,
}) => {
    const { t } = useTranslation();

    if (changes.length === 0) {
        return null;
    }

    return (
        <ul className="mt-0.5 space-y-0.5 text-muted-foreground">
            {changes.map((change) => (
                <li key={change.attribute}>
                    <span className="font-medium">{change.attribute}</span>
                    {': '}
                    {formatAttributeValue(change.before)}{' '}
                    {t(
                        'compare_laravel_migrations_dialog.attribute_change.arrow'
                    )}{' '}
                    {formatAttributeValue(change.after)}
                </li>
            ))}
        </ul>
    );
};
