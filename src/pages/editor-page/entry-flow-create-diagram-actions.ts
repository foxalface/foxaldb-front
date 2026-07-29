export type EntryFlowCreateDiagramTarget = 'guest' | 'remote';

export interface EntryFlowCreateDiagramActions {
    target: EntryFlowCreateDiagramTarget;
    onDiagramCreated: (diagramId: string) => void;
}
