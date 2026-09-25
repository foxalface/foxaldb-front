import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { diagramToJSONOutput } from '@/lib/export-import-utils';
import type { Diagram } from '@/lib/domain/diagram';
import { ExportCodePreviewBlock } from '../export-code-preview-block';

interface ExportJsonDownloadStepProps {
    diagram: Diagram;
}

export const ExportJsonDownloadStep: React.FC<ExportJsonDownloadStepProps> = ({
    diagram,
}) => {
    const { t } = useTranslation();
    const json = useMemo(() => diagramToJSONOutput(diagram), [diagram]);
    const loadingLabel = t('export_wizard.json.download_step.loading');

    return (
        <div
            className="flex min-h-0 w-full flex-1 flex-col"
            data-testid="export-json-download-step"
        >
            <ExportCodePreviewBlock
                code={json}
                isLoading={false}
                language="json"
                loadingAriaLabel={loadingLabel}
                loadingTestId="export-json-generating"
                containerTestId="export-json-preview-container"
            />
        </div>
    );
};
