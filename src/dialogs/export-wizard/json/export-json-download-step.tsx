import React, { useCallback } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { downloadBlob } from '@/lib/download-blob';
import { buildDiagramJsonExportFilename } from '@/lib/build-diagram-json-export-filename';
import { diagramToJSONOutput } from '@/lib/export-import-utils';
import type { Diagram } from '@/lib/domain/diagram';

interface ExportJsonDownloadStepProps {
    diagram: Diagram;
}

export const ExportJsonDownloadStep: React.FC<ExportJsonDownloadStepProps> = ({
    diagram,
}) => {
    const { t } = useTranslation();
    const filename = buildDiagramJsonExportFilename(diagram.name ?? 'diagram');

    const handleDownload = useCallback(() => {
        const json = diagramToJSONOutput(diagram);

        downloadBlob(new Blob([json], { type: 'application/json' }), filename);
    }, [diagram, filename]);

    return (
        <div
            className="flex flex-col gap-4 py-1"
            data-testid="export-json-download-step"
        >
            <p className="text-sm text-muted-foreground">
                {t('export_wizard.json.download_step.explanation')}
            </p>
            <p className="text-sm" data-testid="export-json-filename">
                {t('export_wizard.json.download_step.filename_label', {
                    filename,
                })}
            </p>
            <Button type="button" className="w-fit" onClick={handleDownload}>
                <Download className="mr-1 size-4" />
                {t('export_wizard.json.download_step.download')}
            </Button>
        </div>
    );
};
