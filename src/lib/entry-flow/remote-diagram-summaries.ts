import type { DiagramApiResource } from '@/lib/api/diagrams';
import type { RemoteDiagramSummary } from './entry-flow-types';

export const toRemoteDiagramSummary = (
    diagram: DiagramApiResource
): RemoteDiagramSummary => ({
    id: String(diagram.id),
    name: diagram.name,
    tablesCount: diagram.tables_count ?? 0,
    databaseType: diagram.database_type,
    databaseEdition: diagram.database_edition,
    createdAt: diagram.created_at ?? diagram.createdAt ?? '',
    updatedAt: diagram.updated_at ?? diagram.updatedAt ?? '',
});

export const toRemoteDiagramSummaries = (
    diagrams: DiagramApiResource[]
): RemoteDiagramSummary[] => diagrams.map(toRemoteDiagramSummary);
