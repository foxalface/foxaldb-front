import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useTranslation } from 'react-i18next';
import { copyTextToClipboard } from '@/lib/copy-text-to-clipboard';
import { useToast } from '@/components/toast/use-toast';
import { getIsOldSafari } from '@/safari-compat';
import { exportMarkdownPreviewComponents } from './export-markdown-preview-components';
import { ExportGeneratedPreviewToolbar } from './export-generated-preview-toolbar';

interface ExportGeneratedMarkdownPreviewProps {
    content: string;
    testId?: string;
    onClose: () => void;
}

export const ExportGeneratedMarkdownPreview: React.FC<
    ExportGeneratedMarkdownPreviewProps
> = ({ content, testId, onClose }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);
    const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
    const hiddenCopyTextareaRef = useRef<HTMLTextAreaElement>(null);

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
        const copied = await copyTextToClipboard(content, {
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
    }, [content, t, toast]);

    return (
        <div
            className="group relative h-56 min-h-44 overflow-hidden rounded-md border"
            data-testid={testId ? `${testId}-markdown` : undefined}
        >
            <textarea
                ref={hiddenCopyTextareaRef}
                readOnly
                tabIndex={-1}
                aria-hidden
                value={content}
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
            <div
                className="scrollbar-app h-full overflow-auto break-words px-3 py-2 pr-10 text-sm leading-relaxed text-foreground"
                data-testid={testId ? `${testId}-markdown-content` : undefined}
            >
                <ReactMarkdown
                    remarkPlugins={getIsOldSafari() ? [] : [remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={exportMarkdownPreviewComponents}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};
