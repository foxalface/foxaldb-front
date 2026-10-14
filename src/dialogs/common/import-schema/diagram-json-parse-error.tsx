import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface InvalidDiagramJsonDetectionPanelProps {
    path: string | null;
    className?: string;
}

export const InvalidDiagramJsonDetectionPanel: React.FC<
    InvalidDiagramJsonDetectionPanelProps
> = ({ path, className }) => {
    const { t } = useTranslation();

    return (
        <div
            role="alert"
            className={cn(
                'flex items-start gap-3 rounded-lg border border-destructive px-4 py-3 text-sm',
                className
            )}
        >
            <AlertCircle
                className="mt-0.5 size-4 shrink-0 text-destructive"
                aria-hidden
            />
            <div className="flex flex-col gap-1">
                <span className="font-medium">
                    {t(
                        'new_diagram_dialog.import_schema.detection.invalid_diagram_json'
                    )}
                </span>
                <span className="text-muted-foreground">
                    {t(
                        'new_diagram_dialog.import_schema.errors.invalid_diagram_json_hint'
                    )}
                    {path ? (
                        <>
                            {' '}
                            <code className="break-all rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                                {path}
                            </code>
                        </>
                    ) : null}
                </span>
            </div>
        </div>
    );
};

/** @deprecated Use InvalidDiagramJsonDetectionPanel */
export type DiagramJsonParseErrorContext = 'import' | 'merge';

/** @deprecated Use InvalidDiagramJsonDetectionPanel */
export interface DiagramJsonParseErrorProps {
    path: string | null;
    context: DiagramJsonParseErrorContext;
}

/** @deprecated Use InvalidDiagramJsonDetectionPanel */
export const DiagramJsonParseError: React.FC<DiagramJsonParseErrorProps> = ({
    path,
}) => <InvalidDiagramJsonDetectionPanel path={path} />;
