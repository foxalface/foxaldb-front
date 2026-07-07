import React from 'react';
import { useDiagramEditingBroadcast } from '@/pages/editor-page/use-diagram-editing-broadcast';
import { EditingBroadcastContext } from './editing-broadcast-context';

// Mounted once above both the canvas and the side panel so every edit surface
// shares a single editing-awareness controller.
export const EditingBroadcastProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const value = useDiagramEditingBroadcast();

    return (
        <EditingBroadcastContext.Provider value={value}>
            {children}
        </EditingBroadcastContext.Provider>
    );
};
