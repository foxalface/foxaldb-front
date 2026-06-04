import { createContext } from 'react';
import type { DiagramAccess } from '@/lib/api/diagrams';
import { emptyFn } from '@/lib/utils';

export interface DiagramAccessContextValue {
    diagramAccess: DiagramAccess | null;
    setDiagramAccess: (access: DiagramAccess | null) => void;
    clearDiagramAccess: () => void;
}

export const diagramAccessContext = createContext<DiagramAccessContextValue>({
    diagramAccess: null,
    setDiagramAccess: emptyFn,
    clearDiagramAccess: emptyFn,
});
