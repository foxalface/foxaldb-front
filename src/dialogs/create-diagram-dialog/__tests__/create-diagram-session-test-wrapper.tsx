import React from 'react';
import { CreateDiagramSessionDestinationProvider } from '../create-diagram-session-destination-context';

export const withCreateDiagramSessionDestination = (createDialogOpen = true) =>
    function CreateDiagramSessionDestinationTestWrapper({
        children,
    }: React.PropsWithChildren) {
        return (
            <CreateDiagramSessionDestinationProvider
                createDialogOpen={createDialogOpen}
            >
                {children}
            </CreateDiagramSessionDestinationProvider>
        );
    };
