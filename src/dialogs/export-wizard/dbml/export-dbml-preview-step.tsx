import React, { useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CodeSnippet } from '@/components/code-snippet/code-snippet';
import { Spinner } from '@/components/spinner/spinner';
import { Label } from '@/components/label/label';
import { downloadBlob } from '@/lib/download-blob';
import { buildDbmlExportFilename } from '@/lib/dbml/dbml-export/build-dbml-export-filename';

interface ExportDbmlPreviewStepProps {
    diagramName: string;
    dbml?: string;
    isLoading: boolean;
    hasError: boolean;
}

export const ExportDbmlPreviewStep: React.FC<ExportDbmlPreviewStepProps> = ({
    diagramName,
    dbml,
    isLoading,
    hasError,
}) => {
    const { t } = useTranslation();

    const downloadAction = useMemo(
        () => ({
            label: t('export_wizard.dbml.preview_step.download'),
            icon: Download,
            onClick: () => {
                if (!dbml) {
                    return;
                }

                downloadBlob(
                    new Blob([dbml], { type: 'text/plain' }),
                    buildDbmlExportFilename(diagramName)
                );
            },
        }),
        [dbml, diagramName, t]
    );

    const renderContent = useCallback(() => {
        if (hasError) {
            return (
                <p className="text-sm text-muted-foreground" role="alert">
                    {t('export_wizard.dbml.preview_step.error')}
                </p>
            );
        }

        if (isLoading || dbml === undefined) {
            return (
                <div className="flex flex-col items-center gap-2 py-8">
                    <Spinner />
                    <Label className="text-sm">
                        {t('export_wizard.dbml.preview_step.generating')}
                    </Label>
                </div>
            );
        }

        if (dbml.length === 0) {
            return (
                <p className="text-sm text-muted-foreground" role="alert">
                    {t('export_wizard.dbml.preview_step.empty')}
                </p>
            );
        }

        return (
            <div
                className="h-96 min-h-72 w-full shrink-0"
                data-testid="export-dbml-preview-container"
            >
                <CodeSnippet
                    className="size-full flex-none"
                    code={dbml}
                    language="dbml"
                    autoScroll={true}
                    isComplete={!isLoading}
                    actions={[downloadAction]}
                    actionsTooltipSide="top"
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
        );
    }, [dbml, downloadAction, hasError, isLoading, t]);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col">
                {renderContent()}
            </div>
        </div>
    );
};
