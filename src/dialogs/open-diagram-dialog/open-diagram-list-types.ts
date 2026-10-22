import type { DiagramAccessRole } from '@/lib/api/diagrams';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import type { DatabaseType } from '@/lib/domain/database-type';

export type OpenDiagramTab = 'device' | 'online';

export type OpenDiagramSortColumn =
    | 'database'
    | 'name'
    | 'createdAt'
    | 'updatedAt'
    | 'tablesCount';

export type OpenDiagramSortDirection = 'asc' | 'desc';

export interface OpenDiagramSortState {
    column: OpenDiagramSortColumn;
    direction: OpenDiagramSortDirection;
}

export const DEFAULT_OPEN_DIAGRAM_SORT: OpenDiagramSortState = {
    column: 'updatedAt',
    direction: 'desc',
};

export interface OpenDiagramDeviceRow {
    storage: 'device';
    id: string;
    name: string;
    databaseType: DatabaseType;
    databaseEdition?: DatabaseEdition;
    createdAt: Date;
    updatedAt: Date;
    tablesCount: number;
}

export interface OpenDiagramOnlineRow {
    storage: 'online';
    id: string;
    name: string;
    databaseType: DatabaseType;
    databaseEdition?: DatabaseEdition | null;
    createdAt: Date;
    updatedAt: Date;
    tablesCount: number;
    role: DiagramAccessRole;
}

export type OpenDiagramRow = OpenDiagramDeviceRow | OpenDiagramOnlineRow;
