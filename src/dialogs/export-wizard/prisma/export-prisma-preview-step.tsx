import React, { useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CodeSnippet } from '@/components/code-snippet/code-snippet';
import { Spinner } from '@/components/spinner/spinner';
import { Label } from '@/components/label/label';
import { downloadBlob } from '@/lib/download-blob';
import type {
    PrismaExportError,
    PrismaExportNote,
} from '@/lib/api/prisma-export-types';
import { PRISMA_EXPORT_FILENAME } from '@/lib/export/prisma-export-constants';
import {
    formatPrismaExportError,
    formatGroupedPrismaExportNote,
} from './format-prisma-export-message';
import { groupPrismaExportNotes } from './group-prisma-export-notes';

interface ExportPrismaPreviewStepProps {
    schema?: string;
    notes: PrismaExportNote[];
    generationError: PrismaExportError | null;
    isLoading: boolean;
    hasUnexpectedError: boolean;
}

export const ExportPrismaPreviewStep: React.FC<
    ExportPrismaPreviewStepProps
> = ({ schema, notes, generationError, isLoading, hasUnexpectedError }) => {
    const { t } = useTranslation();

    const errorMessage = useMemo(() => {
        if (generationError) {
            return formatPrismaExportError(generationError, t);
        }

        if (hasUnexpectedError) {
            return t('export_wizard.prisma.preview_step.generation_error');
        }

        return null;
    }, [generationError, hasUnexpectedError, t]);

    const groupedNotes = useMemo(() => groupPrismaExportNotes(notes), [notes]);

    const localizedNotes = useMemo(
        () =>
            groupedNotes.map((group) =>
                formatGroupedPrismaExportNote(group, t)
            ),
        [groupedNotes, t]
    );

    const downloadAction = useMemo(
        () => ({
            label: t('export_wizard.prisma.preview_step.download'),
            icon: Download,
            onClick: () => {
                if (!schema) {
                    return;
                }

                downloadBlob(
                    new Blob([schema], { type: 'text/plain' }),
                    PRISMA_EXPORT_FILENAME
                );
            },
        }),
        [schema, t]
    );

    const renderContent = useCallback(() => {
        if (errorMessage) {
            return (
                <p
                    className="text-sm text-muted-foreground"
                    role="alert"
                    data-testid="export-prisma-generation-error"
                >
                    {errorMessage}
                </p>
            );
        }

        if (isLoading || schema === undefined) {
            return (
                <div
                    className="flex flex-col items-center gap-2 py-8"
                    data-testid="export-prisma-generating"
                >
                    <Spinner />
                    <Label className="text-sm">
                        {t('export_wizard.prisma.preview_step.generating')}
                    </Label>
                </div>
            );
        }

        if (schema.length === 0) {
            return (
                <p className="text-sm text-muted-foreground" role="alert">
                    {t('export_wizard.prisma.preview_step.empty')}
                </p>
            );
        }

        return (
            <div
                className="h-96 min-h-72 w-full shrink-0"
                data-testid="export-prisma-preview-container"
            >
                <CodeSnippet
                    className="size-full flex-none"
                    code={schema}
                    language="plaintext"
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
    }, [downloadAction, errorMessage, isLoading, schema, t]);

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
            {localizedNotes.length > 0 && !errorMessage ? (
                <div
                    className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
                    data-testid="export-prisma-limitations"
                >
                    <p className="font-medium">
                        {t('export_wizard.prisma.preview_step.limitations')}
                    </p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4">
                        {localizedNotes.map((message, index) => (
                            <li
                                key={`${groupedNotes[index]?.code ?? 'note'}-${index}`}
                            >
                                {message}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col">
                {renderContent()}
            </div>
        </div>
    );
};
