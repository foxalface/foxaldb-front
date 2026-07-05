import React, { useMemo } from 'react';
import { useRemoteSelections } from '@/hooks/use-remote-selections';
import { RemoteSelectionsContext } from './remote-selections-context';

// Mounted once per canvas (see canvas.tsx). Do not wrap individual nodes/edges.
export const RemoteSelectionsProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { isSelectionActive, selectionsByEntity } = useRemoteSelections();

    const value = useMemo(
        () => ({
            isSelectionActive,
            selectionsByEntity,
        }),
        [isSelectionActive, selectionsByEntity]
    );

    return (
        <RemoteSelectionsContext.Provider value={value}>
            {children}
        </RemoteSelectionsContext.Provider>
    );
};
