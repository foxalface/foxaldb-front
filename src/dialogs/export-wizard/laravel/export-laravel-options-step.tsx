import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/checkbox/checkbox';
import { Label } from '@/components/label/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import { Spinner } from '@/components/spinner/spinner';
import {
    LARAVEL_VERSIONS,
    type LaravelVersion,
} from '@/lib/api/diagram-laravel-export';
import { buildLaravelExportFilename } from '@/lib/laravel-export/build-laravel-export-filename';
import type { LaravelExportErrorCode } from '@/lib/laravel-export/resolve-laravel-export-error-code';

interface ExportLaravelOptionsStepProps {
    diagramName: string;
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
    diagramName,
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
    const filename = buildLaravelExportFilename(diagramName);

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
        <div
            className="flex flex-col gap-4 py-1"
            data-testid="export-laravel-options-step"
        >
            <p className="text-sm text-muted-foreground">
                {t('export_wizard.laravel.options_step.explanation')}
            </p>
            <p className="text-sm" data-testid="export-laravel-filename">
                {t('export_wizard.laravel.options_step.filename_label', {
                    filename,
                })}
            </p>

            <div className="space-y-2">
                <Label htmlFor="laravel-version">
                    {t('export_wizard.laravel.options_step.laravel_version')}
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

            <div className="flex items-start gap-3">
                <Checkbox
                    id="laravel-include-indexes"
                    className="mt-1"
                    checked={includeIndexes}
                    disabled={isExporting}
                    onCheckedChange={(value) =>
                        onIncludeIndexesChange(value === true)
                    }
                />
                <div className="flex flex-col">
                    <label
                        htmlFor="laravel-include-indexes"
                        className="cursor-pointer font-medium"
                    >
                        {t(
                            'export_wizard.laravel.options_step.include_indexes'
                        )}
                    </label>
                    <span className="text-sm text-muted-foreground">
                        {t(
                            'export_wizard.laravel.options_step.include_indexes_description'
                        )}
                    </span>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <Checkbox
                    id="laravel-include-foreign-keys"
                    className="mt-1"
                    checked={includeForeignKeys}
                    disabled={isExporting}
                    onCheckedChange={(value) =>
                        onIncludeForeignKeysChange(value === true)
                    }
                />
                <div className="flex flex-col">
                    <label
                        htmlFor="laravel-include-foreign-keys"
                        className="cursor-pointer font-medium"
                    >
                        {t(
                            'export_wizard.laravel.options_step.include_foreign_keys'
                        )}
                    </label>
                    <span className="text-sm text-muted-foreground">
                        {t(
                            'export_wizard.laravel.options_step.include_foreign_keys_description'
                        )}
                    </span>
                </div>
            </div>

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
    );
};
