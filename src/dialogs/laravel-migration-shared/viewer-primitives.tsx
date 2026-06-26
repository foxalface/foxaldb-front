import React from 'react';
import { useTranslation } from 'react-i18next';
import type {
    ForeignKeySnapshot,
    ImportWarning,
    TableSnapshot,
} from '@/types/laravel-migration';
import { formatForeignKeyLabel } from './viewer-utils';

export interface MigrationSummaryItemProps {
    label: string;
    value: number;
}

export const MigrationSummaryItem: React.FC<MigrationSummaryItemProps> = ({
    label,
    value,
}) => (
    <div className="rounded-md border px-3 py-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
    </div>
);

export interface MigrationSummaryGridProps {
    children: React.ReactNode;
}

export const MigrationSummaryGrid: React.FC<MigrationSummaryGridProps> = ({
    children,
}) => <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{children}</div>;

export interface MigrationViewerSectionProps {
    title: string;
    children: React.ReactNode;
}

export const MigrationViewerSection: React.FC<MigrationViewerSectionProps> = ({
    title,
    children,
}) => (
    <section className="space-y-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {children}
    </section>
);

export const MigrationEmptyDash: React.FC = () => (
    <p className="text-sm text-muted-foreground">—</p>
);

export type MigrationScrollableListSize = 'sm' | 'md' | 'lg';

const scrollableListClassNames: Record<MigrationScrollableListSize, string> = {
    sm: 'max-h-24',
    md: 'max-h-36',
    lg: 'max-h-48',
};

export interface MigrationScrollableListProps {
    size?: MigrationScrollableListSize;
    textSize?: 'xs' | 'sm';
    children: React.ReactNode;
}

export const MigrationScrollableList: React.FC<
    MigrationScrollableListProps
> = ({ size = 'md', textSize = 'sm', children }) => (
    <ul
        className={`${scrollableListClassNames[size]} space-y-1 overflow-y-auto rounded-md border p-2 ${textSize === 'xs' ? 'text-xs text-muted-foreground' : 'text-sm'}`}
    >
        {children}
    </ul>
);

export interface TableSnapshotListProps {
    tables: TableSnapshot[];
    columnsCountLabel: (count: number) => string;
    indexesCountLabel: (count: number) => string;
}

export const TableSnapshotList: React.FC<TableSnapshotListProps> = ({
    tables,
    columnsCountLabel,
    indexesCountLabel,
}) => (
    <MigrationScrollableList size="lg">
        {tables.map((table) => (
            <li key={table.name}>
                <details>
                    <summary className="cursor-pointer text-sm">
                        <span className="font-medium">{table.name}</span>
                        <span className="ml-2 text-muted-foreground">
                            {columnsCountLabel(table.columns.length)}
                            {' · '}
                            {indexesCountLabel(table.indexes.length)}
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
    </MigrationScrollableList>
);

export interface ForeignKeyListProps {
    foreignKeys: ForeignKeySnapshot[];
}

export const ForeignKeyList: React.FC<ForeignKeyListProps> = ({
    foreignKeys,
}) => (
    <MigrationScrollableList>
        {foreignKeys.map((foreignKey, index) => (
            <li
                key={`${foreignKey.localTable}.${foreignKey.localColumn}-${index}`}
            >
                {formatForeignKeyLabel(foreignKey)}
            </li>
        ))}
    </MigrationScrollableList>
);

export interface WarningListProps {
    warnings: ImportWarning[];
    noneLabel: string;
}

export const WarningList: React.FC<WarningListProps> = ({
    warnings,
    noneLabel,
}) => {
    if (warnings.length === 0) {
        return <p className="text-sm text-muted-foreground">{noneLabel}</p>;
    }

    return (
        <MigrationScrollableList>
            {warnings.map((warning, index) => (
                <li key={`${warning.message}-${index}`}>
                    {warning.message}
                    {warning.relativePath ? (
                        <span className="ml-1 text-muted-foreground">
                            ({warning.relativePath})
                        </span>
                    ) : null}
                </li>
            ))}
        </MigrationScrollableList>
    );
};

export interface MigrationViewerLayoutProps {
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const MigrationViewerLayout: React.FC<MigrationViewerLayoutProps> = ({
    children,
    footer,
}) => (
    <div className="space-y-4">
        {children}
        {footer ? <div className="pt-2">{footer}</div> : null}
    </div>
);

export interface ImportTableSnapshotListProps {
    tables: TableSnapshot[];
}

export const ImportTableSnapshotList: React.FC<
    ImportTableSnapshotListProps
> = ({ tables }) => {
    const { t } = useTranslation();

    return (
        <TableSnapshotList
            tables={tables}
            columnsCountLabel={(count) =>
                t('import_laravel_migrations_dialog.tables.columns_count', {
                    count,
                })
            }
            indexesCountLabel={(count) =>
                t('import_laravel_migrations_dialog.tables.indexes_count', {
                    count,
                })
            }
        />
    );
};
