import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import type { EntryFlowState } from '@/lib/entry-flow';
import { resolveEntryFlowErrorMessageKey } from '@/lib/entry-flow';

export interface EntryFlowRecoverableErrorProps {
    state: EntryFlowState;
    isBlocking: boolean;
    onRetry: () => void;
}

export const EntryFlowRecoverableError: React.FC<
    EntryFlowRecoverableErrorProps
> = ({ state, isBlocking, onRetry }) => {
    const { t } = useTranslation();

    if (state.kind !== 'recoverableError' || isBlocking) {
        return null;
    }

    const messageKey = resolveEntryFlowErrorMessageKey(state.error);

    return (
        <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/95 px-6 text-center"
            role="alert"
            data-testid="entry-flow-recoverable-error"
        >
            <p className="max-w-md text-sm text-muted-foreground">
                {t(messageKey)}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                {t('entry_flow.recovery.retry')}
            </Button>
        </div>
    );
};
