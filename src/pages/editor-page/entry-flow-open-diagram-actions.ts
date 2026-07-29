import type { RemoteDiagramSummary } from '@/lib/entry-flow';

export interface EntryFlowOpenDiagramActions {
    diagrams: RemoteDiagramSummary[];
    canClose: boolean;
    onRemoteDiagramSelected: (diagramId: string) => void;
    onRemoteDiagramSelectionCancelled: () => void;
    onRequestRemoteDiagramCreate: () => void;
}
