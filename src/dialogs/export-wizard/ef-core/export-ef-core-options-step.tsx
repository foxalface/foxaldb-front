import React from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { Label } from '@/components/label/label';
import { Spinner } from '@/components/spinner/spinner';

export type EfCoreWizardRequestErrorKind =
    | 'semantic'
    | 'rate_limited'
    | 'unauthenticated'
    | 'unexpected';

export interface EfCoreWizardRequestError {
    kind: EfCoreWizardRequestErrorKind;
    message?: string;
    code?: string;
    path?: string;
}

interface ExportEfCoreOptionsStepProps {
    providerLabel: string;
    namespaceValue: string;
    dbContextName: string;
    isExporting: boolean;
    error: EfCoreWizardRequestError | null;
    onNamespaceChange: (value: string) => void;
    onDbContextNameChange: (value: string) => void;
    onExport: () => void;
}

export const ExportEfCoreOptionsStep: React.FC<
    ExportEfCoreOptionsStepProps
> = ({
    providerLabel,
    namespaceValue,
    dbContextName,
    isExporting,
    error,
    onNamespaceChange,
    onDbContextNameChange,
    onExport,
}) => {
    const { t } = useTranslation();

    const errorMessage = (() => {
        if (!error) {
            return null;
        }

        switch (error.kind) {
            case 'semantic':
                return error.message && error.message.trim().length > 0
                    ? error.message
                    : t('export_wizard.ef_core.options_step.error_semantic');
            case 'rate_limited':
                return t(
                    'export_wizard.ef_core.options_step.error_rate_limited'
                );
            case 'unauthenticated':
                return t(
                    'export_wizard.ef_core.options_step.error_unauthenticated'
                );
            default:
                return t('export_wizard.ef_core.options_step.error_unexpected');
        }
    })();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isExporting) {
            onExport();
        }
    };

    return (
        <form
            className="flex flex-col gap-4 py-1"
            data-testid="export-ef-core-options-step"
            onSubmit={handleSubmit}
        >
            <p className="text-sm text-muted-foreground">
                {t('export_wizard.ef_core.options_step.explanation')}
            </p>

            <p
                className="text-sm font-medium"
                data-testid="export-ef-core-version-info"
            >
                {t('export_wizard.ef_core.options_step.ef_core_10')}
            </p>

            <p className="text-sm" data-testid="export-ef-core-provider">
                {t('export_wizard.ef_core.options_step.provider_label', {
                    provider: providerLabel,
                })}
            </p>

            <p className="text-sm text-muted-foreground">
                {t(
                    'export_wizard.ef_core.options_step.migrations_not_generated'
                )}
            </p>

            <div className="space-y-2">
                <Label htmlFor="ef-core-namespace">
                    {t('export_wizard.ef_core.options_step.namespace')}
                </Label>
                <Input
                    id="ef-core-namespace"
                    value={namespaceValue}
                    disabled={isExporting}
                    placeholder={t(
                        'export_wizard.ef_core.options_step.namespace_placeholder'
                    )}
                    onChange={(event) => onNamespaceChange(event.target.value)}
                    data-testid="ef-core-namespace-input"
                    autoComplete="off"
                />
                <p className="text-sm text-muted-foreground">
                    {t('export_wizard.ef_core.options_step.namespace_help')}
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="ef-core-db-context">
                    {t('export_wizard.ef_core.options_step.db_context')}
                </Label>
                <Input
                    id="ef-core-db-context"
                    value={dbContextName}
                    disabled={isExporting}
                    placeholder={t(
                        'export_wizard.ef_core.options_step.db_context_placeholder'
                    )}
                    onChange={(event) =>
                        onDbContextNameChange(event.target.value)
                    }
                    data-testid="ef-core-db-context-input"
                    autoComplete="off"
                />
                <p className="text-sm text-muted-foreground">
                    {t('export_wizard.ef_core.options_step.db_context_help')}
                </p>
            </div>

            {errorMessage ? (
                <p
                    className="break-words text-sm text-muted-foreground"
                    role="alert"
                    data-testid="export-ef-core-error"
                    data-error-kind={error?.kind}
                    data-error-code={error?.code}
                >
                    {errorMessage}
                    {error?.kind === 'semantic' && error.code ? (
                        <span className="mt-1 block text-xs">
                            {error.code}
                            {error.path ? ` · ${error.path}` : ''}
                        </span>
                    ) : null}
                </p>
            ) : null}

            {isExporting ? (
                <div
                    className="flex items-center gap-2"
                    data-testid="export-ef-core-generating"
                >
                    <Spinner />
                    <Label className="text-sm">
                        {t('export_wizard.ef_core.options_step.generating')}
                    </Label>
                </div>
            ) : null}

            <Button
                type="submit"
                className="w-fit"
                disabled={isExporting}
                data-testid="export-ef-core-submit"
            >
                <Download className="mr-1 size-4" />
                {t('export_wizard.ef_core.options_step.export')}
            </Button>
        </form>
    );
};
