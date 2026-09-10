import { useCallback, useState } from 'react';
import { useDialog } from '@/hooks/use-dialog';
import { diagramToJSONOutput } from '@/lib/export-import-utils';
import { buildDiagramJsonExportFilename } from '@/lib/build-diagram-json-export-filename';
import { downloadBlob } from '@/lib/download-blob';
import type { Diagram } from '@/lib/domain/diagram';

export const useExportDiagram = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { closeExportDiagramDialog } = useDialog();

    const handleExport = useCallback(
        async ({ diagram }: { diagram: Diagram }) => {
            setIsLoading(true);
            try {
                const json = diagramToJSONOutput(diagram);
                downloadBlob(
                    new Blob([json], { type: 'application/json' }),
                    buildDiagramJsonExportFilename(diagram.name)
                );
                closeExportDiagramDialog();
            } finally {
                setIsLoading(false);
            }
        },
        [closeExportDiagramDialog]
    );

    return {
        exportDiagram: handleExport,
        isExporting: isLoading,
    };
};
