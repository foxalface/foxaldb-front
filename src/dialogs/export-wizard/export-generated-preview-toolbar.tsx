import React from 'react';
import { Copy, CopyCheck, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { CodeBlockHoverActions } from '@/components/code-snippet/code-block-hover-actions';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';

interface ExportGeneratedPreviewToolbarProps {
    onClose: () => void;
    onCopy: () => void;
    isCopied: boolean;
    copyTooltipOpen: boolean;
    onCopyTooltipOpenChange: (open: boolean) => void;
    testId?: string;
}

export const ExportGeneratedPreviewToolbar: React.FC<
    ExportGeneratedPreviewToolbarProps
> = ({
    onClose,
    onCopy,
    isCopied,
    copyTooltipOpen,
    onCopyTooltipOpenChange,
    testId,
}) => {
    const { t } = useTranslation();

    return (
        <CodeBlockHoverActions forceVisible={isCopied || copyTooltipOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span>
                        <Button
                            type="button"
                            className="h-fit p-1.5"
                            variant="outline"
                            onMouseDown={(event) => {
                                event.preventDefault();
                            }}
                            onClick={onClose}
                            aria-label={t(
                                'export_wizard.generated_files.close_preview_aria'
                            )}
                            data-testid={
                                testId ? `${testId}-close-button` : undefined
                            }
                        >
                            <EyeOff size={16} />
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    {t('export_wizard.generated_files.close_preview')}
                </TooltipContent>
            </Tooltip>

            <Tooltip
                onOpenChange={onCopyTooltipOpenChange}
                open={isCopied || copyTooltipOpen}
            >
                <TooltipTrigger asChild>
                    <span>
                        <Button
                            type="button"
                            className="h-fit p-1.5"
                            variant="outline"
                            onMouseDown={(event) => {
                                event.preventDefault();
                            }}
                            onClick={onCopy}
                            data-testid={
                                testId ? `${testId}-copy-button` : undefined
                            }
                        >
                            {isCopied ? (
                                <CopyCheck size={16} />
                            ) : (
                                <Copy size={16} />
                            )}
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    {t(isCopied ? 'copied' : 'copy_to_clipboard')}
                </TooltipContent>
            </Tooltip>
        </CodeBlockHoverActions>
    );
};
