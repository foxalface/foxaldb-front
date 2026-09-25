import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ExportCodePreviewBlock } from '../export-code-preview-block';
import type {
    PrismaExportError,
    PrismaExportNote,
    PrismaExportVersion,
} from '@/lib/api/prisma-export-types';
import {
    formatPrismaExportError,
    formatGroupedPrismaExportNote,
} from './format-prisma-export-message';
import { groupPrismaExportNotes } from './group-prisma-export-notes';
import { PrismaExportVersionToggle } from './prisma-export-version-toggle';
interface ExportPrismaPreviewStepProps {
    prismaVersion: PrismaExportVersion;
    schema?: string;
    notes: PrismaExportNote[];
    generationError: PrismaExportError | null;
    isLoading: boolean;
    hasUnexpectedError: boolean;
    onPrismaVersionChange: (version: PrismaExportVersion) => void;
}

const PREVIEW_AREA_CLASS_NAME = 'relative h-96 min-h-72 w-full shrink-0';

export const ExportPrismaPreviewStep: React.FC<
    ExportPrismaPreviewStepProps
> = ({
    prismaVersion,
    schema,
    notes,
    generationError,
    isLoading,
    hasUnexpectedError,
    onPrismaVersionChange,
}) => {
    const { t } = useTranslation();

    const generatingLabel = t('export_wizard.prisma.preview_step.generating');

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

    const showLimitations =
        localizedNotes.length > 0 &&
        !errorMessage &&
        !isLoading &&
        schema !== undefined &&
        schema.length > 0;

    const isContentReady =
        !isLoading && schema !== undefined && schema.length > 0;

    const renderPreviewArea = () => {
        if (errorMessage) {
            return (
                <div
                    className={cn(
                        PREVIEW_AREA_CLASS_NAME,
                        'flex items-center px-4'
                    )}
                >
                    <p
                        className="text-sm text-muted-foreground"
                        role="alert"
                        data-testid="export-prisma-generation-error"
                    >
                        {errorMessage}
                    </p>
                </div>
            );
        }

        if (!isLoading && schema !== undefined && schema.length === 0) {
            return (
                <div
                    className={cn(
                        PREVIEW_AREA_CLASS_NAME,
                        'flex items-center px-4'
                    )}
                >
                    <p className="text-sm text-muted-foreground" role="alert">
                        {t('export_wizard.prisma.preview_step.empty')}
                    </p>
                </div>
            );
        }

        return (
            <ExportCodePreviewBlock
                code={isContentReady ? schema : undefined}
                isLoading={!isContentReady}
                language="prisma"
                loadingAriaLabel={generatingLabel}
                loadingTestId="export-prisma-generating"
                containerTestId={
                    isContentReady
                        ? 'export-prisma-preview-container'
                        : undefined
                }
            />
        );
    };

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
            <PrismaExportVersionToggle
                value={prismaVersion}
                onValueChange={onPrismaVersionChange}
                disabled={isLoading}
            />

            <div className="flex min-h-0 w-full flex-1 flex-col">
                {renderPreviewArea()}
            </div>

            {showLimitations ? (
                <div
                    role="status"
                    className="flex max-h-36 shrink-0 items-start gap-3 overflow-y-auto rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-3 text-sm dark:border-amber-500/70 dark:bg-amber-500/15"
                    data-testid="export-prisma-limitations"
                >
                    <AlertTriangle
                        className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500"
                        aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                        <p className="font-medium">
                            {t('export_wizard.prisma.preview_step.limitations')}
                        </p>
                        <ul
                            className="mt-1 list-disc space-y-0.5 pl-4"
                            data-testid="export-prisma-limitations-list"
                        >
                            {localizedNotes.map((message, index) => (
                                <li
                                    key={`${groupedNotes[index]?.code ?? 'note'}-${index}`}
                                    className="break-words"
                                >
                                    {message}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
