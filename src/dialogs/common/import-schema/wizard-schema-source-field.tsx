import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { FileCheck2, Upload } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    CodeSnippet,
    type CodeSnippetProps,
} from '@/components/code-snippet/code-snippet';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { IMPORT_SCHEMA_FILE_ACCEPT } from './constants';
import {
    ImportPrivacyInfoDialog,
    ImportPrivacyInfoLink,
    type ImportPrivacyInfoContext,
} from './import-privacy-info-dialog';
import { inferSchemaSourceEditorLanguage } from './infer-schema-source-editor-language';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const EDITOR_MIN_HEIGHT_PX = 256;

const hasFileDrag = (event: React.DragEvent): boolean =>
    event.dataTransfer.types.includes('Files');

export interface WizardSchemaSourceFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onValueChange: (value: string) => void;
    selectedFileName: string | null;
    onFileSelected: (file: File) => void;
    disabled?: boolean;
    chooseFileAriaLabel: string;
    changeFileAriaLabel: string;
    fileErrorMessage?: string | null;
    privacyContext: ImportPrivacyInfoContext;
    accept?: string;
    editorClassName?: string;
}

export const WizardSchemaSourceField: React.FC<
    WizardSchemaSourceFieldProps
> = ({
    label,
    placeholder,
    value,
    onValueChange,
    selectedFileName,
    onFileSelected,
    disabled = false,
    chooseFileAriaLabel,
    changeFileAriaLabel,
    fileErrorMessage = null,
    privacyContext,
    accept = IMPORT_SCHEMA_FILE_ACCEPT,
    editorClassName,
}) => {
    const { t } = useTranslation();
    const labelId = useId();
    const fileInputId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragDepthRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isEditorFocused, setIsEditorFocused] = useState(false);
    const [isPrivacyInfoOpen, setIsPrivacyInfoOpen] = useState(false);

    const language = useMemo(
        () => inferSchemaSourceEditorLanguage(value, selectedFileName),
        [selectedFileName, value]
    );

    const showUploadWatermark =
        value.trim().length === 0 &&
        !selectedFileName &&
        !isDragging &&
        !isEditorFocused &&
        !disabled;

    const showFileLoadedWatermark =
        Boolean(selectedFileName) &&
        value.trim().length === 0 &&
        !isDragging &&
        !isEditorFocused &&
        !disabled;

    const uploadAriaLabel = selectedFileName
        ? changeFileAriaLabel
        : chooseFileAriaLabel;

    const pickFile = useCallback(
        (file: File) => {
            if (disabled) {
                return;
            }
            onFileSelected(file);
        },
        [disabled, onFileSelected]
    );

    const handleFileInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            event.target.value = '';

            if (file) {
                pickFile(file);
            }
        },
        [pickFile]
    );

    const handleDragEnter = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();

            if (disabled || !hasFileDrag(event)) {
                return;
            }

            dragDepthRef.current += 1;
            setIsDragging(true);
        },
        [disabled]
    );

    const handleDragOver = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();

            if (disabled || !hasFileDrag(event)) {
                return;
            }

            event.dataTransfer.dropEffect = 'copy';
            setIsDragging(true);
        },
        [disabled]
    );

    const handleDragLeave = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();

            if (disabled) {
                return;
            }

            dragDepthRef.current -= 1;

            if (dragDepthRef.current <= 0) {
                dragDepthRef.current = 0;
                setIsDragging(false);
            }
        },
        [disabled]
    );

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            dragDepthRef.current = 0;
            setIsDragging(false);

            if (disabled) {
                return;
            }

            const file = event.dataTransfer.files?.[0];

            if (file) {
                pickFile(file);
            }
        },
        [disabled, pickFile]
    );

    const editorProps = useMemo((): CodeSnippetProps['editorProps'] => {
        return {
            height: EDITOR_MIN_HEIGHT_PX,
            onChange: (nextValue) => {
                onValueChange(nextValue ?? '');
            },
            onMount: (editorInstance) => {
                editorInstance.onDidFocusEditorText(() => {
                    setIsEditorFocused(true);
                });
                editorInstance.onDidBlurEditorText(() => {
                    setIsEditorFocused(false);
                });
            },
            options: {
                ariaLabel: label,
                readOnly: disabled,
                wordWrap: 'off',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderValidationDecorations: 'off',
                lineDecorationsWidth: 0,
                overviewRulerBorder: false,
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                contextmenu: true,
                guides: {
                    indentation: false,
                },
                minimap: { enabled: false },
                scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    alwaysConsumeMouseWheel: false,
                },
            },
        };
    }, [disabled, label, onValueChange]);

    return (
        <>
            <div
                className="flex flex-col gap-2"
                data-testid="wizard-schema-source-field"
            >
                <span id={labelId} className="text-sm font-medium">
                    {label}
                </span>

                <div
                    className="group relative min-h-64 w-full min-w-0"
                    aria-labelledby={labelId}
                    data-testid="wizard-schema-source-editor"
                    data-editor-language={language}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        id={fileInputId}
                        type="file"
                        accept={accept}
                        className="sr-only"
                        tabIndex={-1}
                        aria-hidden
                        onChange={handleFileInputChange}
                        disabled={disabled}
                    />

                    <div
                        className={cn(
                            'wizard-schema-upload-actions absolute right-1 top-1 z-10 flex flex-col gap-1',
                            selectedFileName &&
                                'wizard-schema-upload-actions--visible'
                        )}
                    >
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        type="button"
                                        className="h-fit p-1.5"
                                        variant="outline"
                                        tabIndex={-1}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                        }}
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={disabled}
                                        aria-label={uploadAriaLabel}
                                    >
                                        {selectedFileName ? (
                                            <FileCheck2 size={16} aria-hidden />
                                        ) : (
                                            <Upload size={16} aria-hidden />
                                        )}
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                {uploadAriaLabel}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {showUploadWatermark ? (
                        <div
                            className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 px-12 text-center"
                            aria-hidden
                        >
                            <Upload
                                className="size-12 text-muted-foreground/20"
                                strokeWidth={1.25}
                            />
                            <p className="max-w-56 text-xs text-muted-foreground/50">
                                {placeholder}
                            </p>
                        </div>
                    ) : null}

                    {showFileLoadedWatermark && selectedFileName ? (
                        <div
                            className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 px-12 text-center"
                            aria-hidden
                            data-testid="wizard-schema-file-loaded-watermark"
                        >
                            <FileCheck2
                                className="size-12 text-muted-foreground/20"
                                strokeWidth={1.25}
                            />
                            <p
                                className="max-w-56 truncate text-xs text-muted-foreground/50"
                                title={selectedFileName}
                            >
                                {selectedFileName}
                            </p>
                        </div>
                    ) : null}

                    <CodeSnippet
                        className={cn(
                            'min-h-64 w-full flex-none',
                            isDragging &&
                                !disabled &&
                                'border-primary ring-1 ring-primary/30',
                            disabled && 'opacity-70',
                            editorClassName
                        )}
                        code={value}
                        language={language}
                        allowCopy={false}
                        editorProps={editorProps}
                    />
                </div>

                {showFileLoadedWatermark && selectedFileName ? (
                    <p role="status" className="sr-only">
                        {t('new_diagram_dialog.import_schema.selected_file', {
                            name: selectedFileName,
                        })}
                    </p>
                ) : null}

                <div className="flex justify-center">
                    <ImportPrivacyInfoLink
                        onClick={() => setIsPrivacyInfoOpen(true)}
                    />
                </div>

                {selectedFileName && !showFileLoadedWatermark ? (
                    <p role="status" className="text-xs text-muted-foreground">
                        {t('new_diagram_dialog.import_schema.selected_file', {
                            name: selectedFileName,
                        })}
                    </p>
                ) : null}

                {fileErrorMessage ? (
                    <p role="alert" className="text-sm text-destructive">
                        {fileErrorMessage}
                    </p>
                ) : null}
            </div>

            <ImportPrivacyInfoDialog
                open={isPrivacyInfoOpen}
                onOpenChange={setIsPrivacyInfoOpen}
                context={privacyContext}
            />
        </>
    );
};
