import React, { useCallback, useEffect, useState } from 'react';
import type { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import {
    CodeSnippet,
    type CodeSnippetProps,
} from '@/components/code-snippet/code-snippet';
import { cn } from '@/lib/utils';
import { ExportCodePreviewSkeleton } from './export-code-preview-skeleton';

const PREVIEW_AREA_CLASS_NAME =
    'relative h-96 min-h-72 w-full min-w-0 shrink-0 overflow-hidden';

export interface ExportCodePreviewBlockProps {
    code?: string;
    isLoading: boolean;
    language: NonNullable<CodeSnippetProps['language']>;
    loadingAriaLabel: string;
    loadingTestId?: string;
    containerTestId?: string;
    header?: React.ReactNode;
    editorProps?: CodeSnippetProps['editorProps'];
    codeSnippetClassName?: string;
}

export const ExportCodePreviewBlock: React.FC<ExportCodePreviewBlockProps> = ({
    code,
    isLoading,
    language,
    loadingAriaLabel,
    loadingTestId,
    containerTestId,
    header,
    editorProps,
    codeSnippetClassName,
}) => {
    const [isEditorReady, setIsEditorReady] = useState(false);
    const isContentLoading = isLoading || code === undefined;
    const showSkeleton = isContentLoading || !isEditorReady;

    useEffect(() => {
        if (isContentLoading) {
            setIsEditorReady(false);
        }
    }, [isContentLoading]);

    const handleEditorMount = useCallback(
        (editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco) => {
            setIsEditorReady(true);
            editorProps?.onMount?.(editorInstance, monaco);
        },
        [editorProps]
    );

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
            {header}

            <div
                className={PREVIEW_AREA_CLASS_NAME}
                data-testid={containerTestId}
            >
                {showSkeleton ? (
                    <ExportCodePreviewSkeleton
                        testId={loadingTestId}
                        ariaLabel={loadingAriaLabel}
                        className={
                            !isContentLoading
                                ? 'absolute inset-0 z-10'
                                : undefined
                        }
                    />
                ) : null}

                {!isContentLoading ? (
                    <div
                        className={cn(
                            'absolute inset-0 overflow-hidden',
                            showSkeleton && 'invisible'
                        )}
                    >
                        <CodeSnippet
                            className={cn(
                                'size-full flex-none',
                                codeSnippetClassName
                            )}
                            code={code}
                            language={language}
                            editorProps={{
                                ...editorProps,
                                onMount: handleEditorMount,
                                options: {
                                    scrollbar: {
                                        vertical: 'auto',
                                        horizontal: 'auto',
                                    },
                                    ...editorProps?.options,
                                },
                            }}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
};
