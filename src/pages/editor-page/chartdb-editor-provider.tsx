import React from 'react';
import { ChartDBProvider } from '@/context/chartdb-context/chartdb-provider';
import { useDiagramAccess } from '@/hooks/use-diagram-access';

export const ChartDBEditorProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { diagramAccess } = useDiagramAccess();
    const readonly = diagramAccess?.can_edit === false;

    return <ChartDBProvider readonly={readonly}>{children}</ChartDBProvider>;
};
