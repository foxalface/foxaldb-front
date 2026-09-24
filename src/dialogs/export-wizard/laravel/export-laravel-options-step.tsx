import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/label/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import { Spinner } from '@/components/spinner/spinner';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import {
    LARAVEL_VERSIONS,
    type LaravelVersion,
} from '@/lib/api/diagram-laravel-export';
import type { LaravelExportErrorCode } from '@/lib/laravel-export/resolve-laravel-export-error-code';
import { ExportWizardCheckboxOption } from '../export-wizard-checkbox-option';

interface ExportLaravelOptionsStepProps {
    laravelVersion: LaravelVersion;
    includeIndexes: boolean;
    includeForeignKeys: boolean;
    isExporting: boolean;
    errorCode: LaravelExportErrorCode | null;
    onLaravelVersionChange: (version: LaravelVersion) => void;
    onIncludeIndexesChange: (includeIndexes: boolean) => void;
    onIncludeForeignKeysChange: (includeForeignKeys: boolean) => void;
}

export const ExportLaravelOptionsStep: React.FC<
    ExportLaravelOptionsStepProps
> = ({
    laravelVersion,
    includeIndexes,
    includeForeignKeys,
    isExporting,
    errorCode,
    onLaravelVersionChange,
    onIncludeIndexesChange,
    onIncludeForeignKeysChange,
}) => {
    const { t } = useTranslation();

    const errorMessage = useMemo(() => {
        if (!errorCode) {
            return null;
        }

        switch (errorCode) {
            case 'unauthenticated':
                return t(
                    'export_wizard.laravel.options_step.error_unauthenticated'
                );
            case 'forbidden':
                return t('export_wizard.laravel.options_step.error_forbidden');
            case 'not_found':
                return t('export_wizard.laravel.options_step.error_not_found');
            case 'empty':
                return t('export_wizard.laravel.options_step.error_empty');
            case 'invalid':
                return t('export_wizard.laravel.options_step.error_invalid');
            case 'network':
                return t('export_wizard.laravel.options_step.error_network');
            default:
                return t('export_wizard.laravel.options_step.error');
        }
    }, [errorCode, t]);

    return (
        <TooltipProvider>
            <div
                className="flex flex-col gap-4 py-1"
                data-testid="export-laravel-options-step"
            >
                <div className="flex items-center gap-3">
                    <Label htmlFor="laravel-version" className="shrink-0">
                        {t(
                            'export_wizard.laravel.options_step.laravel_version'
                        )}
                    </Label>
                    <Select
                        value={laravelVersion}
                        onValueChange={(value) =>
                            onLaravelVersionChange(value as LaravelVersion)
                        }
                        disabled={isExporting}
                    >
                        <SelectTrigger
                            id="laravel-version"
                            className="w-20"
                            data-testid="laravel-version-select"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LARAVEL_VERSIONS.map((version) => (
                                <SelectItem
                                    key={version}
                                    value={version}
                                    data-testid={`laravel-version-${version}`}
                                >
                                    {version}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <ExportWizardCheckboxOption
                    id="laravel-include-indexes"
                    label={t(
                        'export_wizard.laravel.options_step.include_indexes'
                    )}
                    description={t(
                        'export_wizard.laravel.options_step.include_indexes_description'
                    )}
                    checked={includeIndexes}
                    disabled={isExporting}
                    onCheckedChange={onIncludeIndexesChange}
                />

                <ExportWizardCheckboxOption
                    id="laravel-include-foreign-keys"
                    label={t(
                        'export_wizard.laravel.options_step.include_foreign_keys'
                    )}
                    description={t(
                        'export_wizard.laravel.options_step.include_foreign_keys_description'
                    )}
                    checked={includeForeignKeys}
                    disabled={isExporting}
                    onCheckedChange={onIncludeForeignKeysChange}
                />

                {errorMessage ? (
                    <p
                        className="text-sm text-muted-foreground"
                        role="alert"
                        data-testid="export-laravel-error"
                    >
                        {errorMessage}
                    </p>
                ) : null}

                {isExporting ? (
                    <div
                        className="flex items-center gap-2"
                        data-testid="export-laravel-generating"
                    >
                        <Spinner />
                        <Label className="text-sm">
                            {t('export_wizard.laravel.options_step.generating')}
                        </Label>
                    </div>
                ) : null}
            </div>
        </TooltipProvider>
    );
};
