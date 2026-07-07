import React, { useMemo } from 'react';
import { useRemoteEditing } from '@/hooks/use-remote-editing';
import { RemoteEditingContext } from './remote-editing-context';

// Mounted once above both the canvas and the side panel (see editor-page.tsx)
// so every edit surface shares a single editing-awareness reducer. Do not wrap
// individual nodes/fields.
export const RemoteEditingProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { isEditingActive, editingByEntity } = useRemoteEditing();

    const value = useMemo(
        () => ({
            isEditingActive,
            editingByEntity,
        }),
        [isEditingActive, editingByEntity]
    );

    return (
        <RemoteEditingContext.Provider value={value}>
            {children}
        </RemoteEditingContext.Provider>
    );
};
