import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { CodeSnippet } from '@/components/code-snippet/code-snippet';
import { useToast } from '@/components/toast/use-toast';
import { copyTextToClipboard } from '@/lib/copy-text-to-clipboard';
import type { ExportGeneratedFile } from './export-generated-file';
import { ExportGeneratedMarkdownPreview } from './export-generated-markdown-preview';
import { ExportGeneratedPreviewToolbar } from './export-generated-preview-toolbar';
import {
    inferExportFileLanguage,
    isMarkdownExportFile,
} from './infer-export-file-language';

interface ExportGeneratedFilePreviewProps {
    file: ExportGeneratedFile;
    testId?: string;
    onClose: () => void;
}

export const ExportGeneratedFilePreview: React.FC<
    ExportGeneratedFilePreviewProps
> = ({ file, testId, onClose }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);
    const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
    const hiddenCopyTextareaRef = useRef<HTMLTextAreaElement>(null);
    const isMarkdown = useMemo(
        () => isMarkdownExportFile(file.path),
        [file.path]
    );
    const language = useMemo(
        () => inferExportFileLanguage(file.path),
        [file.path]
    );

    useEffect(() => {
        if (!isCopied) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setIsCopied(false);
        }, 1500);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isCopied]);

    const copyToClipboard = useCallback(async () => {
        const copied = await copyTextToClipboard(file.content, {
            fallbackElement: hiddenCopyTextareaRef.current,
        });

        if (copied) {
            setIsCopied(true);
            return;
        }

        setIsCopied(false);
        toast({
            title: t('copy_to_clipboard_toast.failed.title'),
            variant: 'destructive',
            description: t('copy_to_clipboard_toast.failed.description'),
        });
    }, [file.content, t, toast]);

    return (
        <div className="flex flex-col gap-1.5" data-testid={testId}>
            <p
                className="truncate text-xs text-muted-foreground"
                title={file.path}
                data-testid={testId ? `${testId}-path` : undefined}
            >
                {file.path}
            </p>
            {isMarkdown ? (
                <ExportGeneratedMarkdownPreview
                    content={file.content}
                    testId={testId}
                    onClose={onClose}
                />
            ) : (
                <div
                    className="group relative h-56 min-h-44 w-full overflow-hidden rounded-md border"
                    data-testid={testId ? `${testId}-editor` : undefined}
                >
                    <textarea
                        ref={hiddenCopyTextareaRef}
                        readOnly
                        tabIndex={-1}
                        aria-hidden
                        value={file.content}
                        className="pointer-events-none fixed left-0 top-0 size-px opacity-0"
                    />
                    <ExportGeneratedPreviewToolbar
                        onClose={onClose}
                        onCopy={copyToClipboard}
                        isCopied={isCopied}
                        copyTooltipOpen={copyTooltipOpen}
                        onCopyTooltipOpenChange={setCopyTooltipOpen}
                        testId={testId}
                    />
                    <CodeSnippet
                        className="size-full flex-none border-0"
                        code={file.content}
                        language={language}
                        allowCopy={false}
                        editorProps={{
                            options: {
                                readOnly: true,
                                scrollbar: {
                                    vertical: 'auto',
                                    horizontal: 'auto',
                                },
                            },
                        }}
                    />
                </div>
            )}
        </div>
    );
};
