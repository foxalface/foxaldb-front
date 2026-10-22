import type { DiagramApiResource, DiagramAccessRole } from '@/lib/api/diagrams';
import type { Diagram } from '@/lib/domain/diagram';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import { DatabaseType } from '@/lib/domain/database-type';
import type { RemoteDiagramSummary } from '@/lib/entry-flow';
import type {
    OpenDiagramDeviceRow,
    OpenDiagramOnlineRow,
} from './open-diagram-list-types';

const toDatabaseType = (value?: string): DatabaseType =>
    (value ?? DatabaseType.GENERIC) as DatabaseType;

const toDatabaseEdition = (
    value?: string | null
): DatabaseEdition | undefined => {
    if (value === undefined || value === null) {
        return undefined;
    }

    return value as DatabaseEdition;
};

const resolveAccessRole = (
    accessRole: string | null | undefined
): DiagramAccessRole => {
    if (
        accessRole === 'owner' ||
        accessRole === 'editor' ||
        accessRole === 'viewer'
    ) {
        return accessRole;
    }

    return 'owner';
};

export const diagramToDeviceRow = (
    diagram: Diagram,
    tablesCount: number
): OpenDiagramDeviceRow => ({
    storage: 'device',
    id: diagram.id,
    name: diagram.name,
    databaseType: diagram.databaseType,
    databaseEdition: diagram.databaseEdition,
    createdAt: diagram.createdAt,
    updatedAt: diagram.updatedAt,
    tablesCount,
});

export const apiDiagramToOnlineRow = (
    diagram: DiagramApiResource
): OpenDiagramOnlineRow => ({
    storage: 'online',
    id: String(diagram.id),
    name: diagram.name,
    databaseType: toDatabaseType(diagram.database_type),
    databaseEdition: toDatabaseEdition(diagram.database_edition),
    createdAt: new Date(diagram.created_at ?? diagram.createdAt ?? 0),
    updatedAt: new Date(diagram.updated_at ?? diagram.updatedAt ?? 0),
    tablesCount: diagram.tables_count ?? 0,
    role: resolveAccessRole(diagram.access?.role),
});

export const remoteSummaryToOnlineRow = (
    summary: RemoteDiagramSummary
): OpenDiagramOnlineRow => ({
    storage: 'online',
    id: summary.id,
    name: summary.name,
    databaseType: toDatabaseType(summary.databaseType),
    databaseEdition: toDatabaseEdition(summary.databaseEdition),
    createdAt: new Date(summary.createdAt || 0),
    updatedAt: new Date(summary.updatedAt || 0),
    tablesCount: summary.tablesCount,
    role: resolveAccessRole(summary.role),
});
