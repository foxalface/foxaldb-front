import React, { useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import { Label } from '@/components/label/label';
import { Spinner } from '@/components/spinner/spinner';
import { buildVisualExportFilename } from '@/lib/visual-export/build-visual-export-filename';
import type {
    VisualExportExtent,
    VisualExportFormat,
} from '@/lib/visual-export/visual-export-options';
import { cn } from '@/lib/utils';

interface ExportVisualOptionsStepProps {
    format: VisualExportFormat;
    diagramName: string;
    extent: VisualExportExtent;
    scale: number;
    includePatternBG: boolean;
    transparent: boolean;
    isExporting: boolean;
    errorCode: string | null;
    onExtentChange: (extent: VisualExportExtent) => void;
    onScaleChange: (scale: number) => void;
    onIncludePatternBGChange: (includePatternBG: boolean) => void;
    onTransparentChange: (transparent: boolean) => void;
    onExport: () => void;
}

const SCALE_OPTIONS = [1, 2, 4] as const;

export const ExportVisualOptionsStep: React.FC<
    ExportVisualOptionsStepProps
> = ({
    format,
    diagramName,
    extent,
    scale,
    includePatternBG,
    transparent,
    isExporting,
    errorCode,
    onExtentChange,
    onScaleChange,
    onIncludePatternBGChange,
    onTransparentChange,
    onExport,
}) => {
    const { t } = useTranslation();
    const filename = buildVisualExportFilename(diagramName, format);
    const showScale = format !== 'svg';
    const showTransparent = format === 'png';

    const errorMessage = useMemo(() => {
        if (!errorCode) {
            return null;
        }

        if (errorCode === 'raster_too_large') {
            return t('export_wizard.visual.options_step.error_too_large', {
                scale: `${scale}x`,
            });
        }

        if (errorCode === 'canvas_unavailable') {
            return t('export_wizard.visual.options_step.error_canvas');
        }

        if (errorCode === 'empty_diagram') {
            return t('export_wizard.visual.options_step.error_empty');
        }

        return t('export_wizard.visual.options_step.error');
    }, [errorCode, scale, t]);

    const handleExtentDiagram = useCallback(() => {
        onExtentChange('diagram');
    }, [onExtentChange]);

    const handleExtentViewport = useCallback(() => {
        onExtentChange('viewport');
    }, [onExtentChange]);

    return (
        <div
            className="flex flex-col gap-4 py-1"
            data-testid="export-visual-options-step"
            data-format={format}
        >
            {format === 'svg' ? (
                <p className="text-sm text-muted-foreground">
                    {t('export_wizard.visual.options_step.svg_limitation')}
                </p>
            ) : (
                <p className="text-sm text-muted-foreground">
                    {t('export_wizard.visual.options_step.explanation')}
                </p>
            )}

            <p className="text-sm" data-testid="export-visual-filename">
                {t('export_wizard.visual.options_step.filename_label', {
                    filename,
                })}
            </p>

            <div className="flex flex-col gap-2">
                <Label>
                    {t('export_wizard.visual.options_step.extent_label')}
                </Label>
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        data-testid="visual-extent-diagram"
                        aria-pressed={extent === 'diagram'}
                        className={cn(
                            'rounded-lg border p-3 text-left transition-colors hover:bg-muted/50',
                            extent === 'diagram' && 'border-primary bg-muted/50'
                        )}
                        onClick={handleExtentDiagram}
                        disabled={isExporting}
                    >
                        <span className="block font-medium leading-snug">
                            {t(
                                'export_wizard.visual.options_step.extent_diagram'
                            )}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                            {t(
                                'export_wizard.visual.options_step.extent_diagram_description'
                            )}
                        </span>
                    </button>
                    <button
                        type="button"
                        data-testid="visual-extent-viewport"
                        aria-pressed={extent === 'viewport'}
                        className={cn(
                            'rounded-lg border p-3 text-left transition-colors hover:bg-muted/50',
                            extent === 'viewport' &&
                                'border-primary bg-muted/50'
                        )}
                        onClick={handleExtentViewport}
                        disabled={isExporting}
                    >
                        <span className="block font-medium leading-snug">
                            {t(
                                'export_wizard.visual.options_step.extent_viewport'
                            )}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                            {t(
                                'export_wizard.visual.options_step.extent_viewport_description'
                            )}
                        </span>
                    </button>
                </div>
            </div>

            {showScale ? (
                <div className="flex flex-col gap-2">
                    <Label>
                        {t('export_wizard.visual.options_step.scale_label')}
                    </Label>
                    <div className="flex gap-2">
                        {SCALE_OPTIONS.map((option) => (
                            <Button
                                key={option}
                                type="button"
                                variant={
                                    scale === option ? 'default' : 'secondary'
                                }
                                data-testid={`visual-scale-${option}x`}
                                onClick={() => onScaleChange(option)}
                                disabled={isExporting}
                            >
                                {t(
                                    `export_wizard.visual.options_step.scale_${option}x`
                                )}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : null}

            <div className="flex items-start gap-3">
                <Checkbox
                    id="visual-pattern-checkbox"
                    className="mt-1"
                    checked={includePatternBG}
                    disabled={isExporting}
                    onCheckedChange={(value) =>
                        onIncludePatternBGChange(value === true)
                    }
                />
                <div className="flex flex-col">
                    <label
                        htmlFor="visual-pattern-checkbox"
                        className="cursor-pointer font-medium"
                    >
                        {t('export_wizard.visual.options_step.pattern')}
                    </label>
                    <span className="text-sm text-muted-foreground">
                        {t(
                            'export_wizard.visual.options_step.pattern_description'
                        )}
                    </span>
                </div>
            </div>

            {showTransparent ? (
                <div className="flex items-start gap-3">
                    <Checkbox
                        id="visual-transparent-checkbox"
                        className="mt-1"
                        checked={transparent}
                        disabled={isExporting}
                        onCheckedChange={(value) =>
                            onTransparentChange(value === true)
                        }
                    />
                    <div className="flex flex-col">
                        <label
                            htmlFor="visual-transparent-checkbox"
                            className="cursor-pointer font-medium"
                        >
                            {t('export_wizard.visual.options_step.transparent')}
                        </label>
                        <span className="text-sm text-muted-foreground">
                            {t(
                                'export_wizard.visual.options_step.transparent_description'
                            )}
                        </span>
                    </div>
                </div>
            ) : null}

            {errorMessage ? (
                <p
                    className="text-sm text-muted-foreground"
                    role="alert"
                    data-testid="export-visual-error"
                >
                    {errorMessage}
                </p>
            ) : null}

            {isExporting ? (
                <div
                    className="flex items-center gap-2"
                    data-testid="export-visual-generating"
                >
                    <Spinner />
                    <Label className="text-sm">
                        {t('export_wizard.visual.options_step.generating')}
                    </Label>
                </div>
            ) : null}

            <Button
                type="button"
                className="w-fit"
                onClick={onExport}
                disabled={isExporting}
                data-testid="export-visual-submit"
            >
                <Download className="mr-1 size-4" />
                {t('export_wizard.visual.options_step.export')}
            </Button>
        </div>
    );
};
