import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { ExportInlineLoadingSkeleton } from '../export-inline-loading-skeleton';
import type {
    VisualExportExtent,
    VisualExportFormat,
} from '@/lib/visual-export/visual-export-options';
import { ExportWizardCheckboxOption } from '../export-wizard-checkbox-option';
import { VisualExportExtentToggle } from './visual-export-extent-toggle';
import { VisualExportScaleToggle } from './visual-export-scale-toggle';

interface ExportVisualOptionsStepProps {
    format: VisualExportFormat;
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
}

export const ExportVisualOptionsStep: React.FC<
    ExportVisualOptionsStepProps
> = ({
    format,
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
}) => {
    const { t } = useTranslation();
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

    return (
        <TooltipProvider>
            <div
                className="flex flex-col gap-4 py-1"
                data-testid="export-visual-options-step"
                data-format={format}
            >
                <VisualExportExtentToggle
                    value={extent}
                    onValueChange={onExtentChange}
                    disabled={isExporting}
                />

                {showScale ? (
                    <VisualExportScaleToggle
                        value={scale}
                        onValueChange={onScaleChange}
                        disabled={isExporting}
                    />
                ) : null}

                <ExportWizardCheckboxOption
                    id="visual-pattern-checkbox"
                    label={t('export_wizard.visual.options_step.pattern')}
                    description={t(
                        'export_wizard.visual.options_step.pattern_description'
                    )}
                    checked={includePatternBG}
                    disabled={isExporting}
                    onCheckedChange={onIncludePatternBGChange}
                />

                {showTransparent ? (
                    <ExportWizardCheckboxOption
                        id="visual-transparent-checkbox"
                        label={t(
                            'export_wizard.visual.options_step.transparent'
                        )}
                        description={t(
                            'export_wizard.visual.options_step.transparent_description'
                        )}
                        checked={transparent}
                        disabled={isExporting}
                        onCheckedChange={onTransparentChange}
                    />
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
                    <ExportInlineLoadingSkeleton
                        testId="export-visual-generating"
                        ariaLabel={t(
                            'export_wizard.visual.options_step.generating'
                        )}
                    />
                ) : null}
            </div>
        </TooltipProvider>
    );
};
