import React from 'react';

/** @deprecated No longer wraps session destination — kept to minimize test churn. */
export const withCreateDiagramSessionDestination = (
    _legacyCreateDialogOpen?: boolean
) => {
    void _legacyCreateDialogOpen;
    return function CreateDiagramSessionDestinationTestWrapper({
        children,
    }: React.PropsWithChildren) {
        return <>{children}</>;
    };
};
