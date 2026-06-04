import React, { useCallback, useMemo, useState } from 'react';
import type { DiagramAccess } from '@/lib/api/diagrams';
import { diagramAccessContext } from './diagram-access-context';

export const DiagramAccessProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [diagramAccess, setDiagramAccessState] =
        useState<DiagramAccess | null>(null);

    const setDiagramAccess = useCallback((access: DiagramAccess | null) => {
        setDiagramAccessState(access);
    }, []);

    const clearDiagramAccess = useCallback(() => {
        setDiagramAccessState(null);
    }, []);

    const value = useMemo(
        () => ({
            diagramAccess,
            setDiagramAccess,
            clearDiagramAccess,
        }),
        [diagramAccess, setDiagramAccess, clearDiagramAccess]
    );

    return (
        <diagramAccessContext.Provider value={value}>
            {children}
        </diagramAccessContext.Provider>
    );
};
