import React, { useMemo } from 'react';
import { CodeSnippet } from '@/components/code-snippet/code-snippet';
import { diagramToJSONOutput } from '@/lib/export-import-utils';
import type { Diagram } from '@/lib/domain/diagram';

interface ExportJsonDownloadStepProps {
    diagram: Diagram;
}

export const ExportJsonDownloadStep: React.FC<ExportJsonDownloadStepProps> = ({
    diagram,
}) => {
    const json = useMemo(() => diagramToJSONOutput(diagram), [diagram]);

    return (
        <div
            className="flex min-h-0 flex-1 flex-col"
            data-testid="export-json-download-step"
        >
            <div
                className="h-96 min-h-72 w-full shrink-0"
                data-testid="export-json-preview-container"
            >
                <CodeSnippet
                    className="size-full flex-none"
                    code={json}
                    language="json"
                    isComplete={true}
                    editorProps={{
                        options: {
                            scrollbar: {
                                vertical: 'auto',
                                horizontal: 'auto',
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};
