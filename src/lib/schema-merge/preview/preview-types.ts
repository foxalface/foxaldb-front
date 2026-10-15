import type { ChangeType, DiffOperation } from '../diff-types';
import type { Diagram } from '@/lib/domain/diagram';

export type MergeChangeVisual = ChangeType;

export interface MergePreviewDecorations {
    tables: Record<string, MergeChangeVisual>;
    fields: Record<string, MergeChangeVisual>;
    relationships: Record<string, MergeChangeVisual>;
}

export const emptyMergePreviewDecorations = (): MergePreviewDecorations => ({
    tables: {},
    fields: {},
    relationships: {},
});

export interface SchemaMergePreviewResult {
    diagram: Diagram;
    decorations: MergePreviewDecorations;
}

export interface BuildSchemaMergePreviewInput {
    baseDiagram: Diagram;
    incomingDiagram: Diagram;
    operations: readonly DiffOperation[];
    selectedOperationIds: ReadonlySet<string>;
    viewsCompared: boolean;
    defaultSchema: string | null;
}
