import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EntryFlowRecoverableError } from '../entry-flow-recoverable-error';
import type { EntryFlowState } from '@/lib/entry-flow';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('EntryFlowRecoverableError', () => {
    const recoverable: EntryFlowState = {
        kind: 'recoverableError',
        error: {
            kind: 'diagramOpen',
            messageKey: 'entry_flow.errors.open_diagram_failed',
        },
        entrySource: 'startup',
        openingContext: {
            diagramId: '77',
            diagramSource: 'directRoute',
        },
    };

    it('renders message and retry while recoverable and not blocking', async () => {
        const onRetry = vi.fn();
        const user = userEvent.setup();

        render(
            <EntryFlowRecoverableError
                state={recoverable}
                isBlocking={false}
                onRetry={onRetry}
            />
        );

        expect(
            screen.getByText('entry_flow.errors.open_diagram_failed')
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'entry_flow.recovery.retry' })
        );

        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('hides while blocking loader is active', () => {
        render(
            <EntryFlowRecoverableError
                state={recoverable}
                isBlocking
                onRetry={vi.fn()}
            />
        );

        expect(
            screen.queryByTestId('entry-flow-recoverable-error')
        ).not.toBeInTheDocument();
    });

    it('hides outside recoverableError', () => {
        render(
            <EntryFlowRecoverableError
                state={{ kind: 'ready' }}
                isBlocking={false}
                onRetry={vi.fn()}
            />
        );

        expect(
            screen.queryByTestId('entry-flow-recoverable-error')
        ).not.toBeInTheDocument();
    });
});
