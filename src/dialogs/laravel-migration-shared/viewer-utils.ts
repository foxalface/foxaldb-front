import type { ForeignKeySnapshot } from '@/types/laravel-migration';

export const formatForeignKeyLabel = (foreignKey: ForeignKeySnapshot): string =>
    `${foreignKey.localTable}.${foreignKey.localColumn} → ${foreignKey.referencedTable}.${foreignKey.referencedColumn}`;
