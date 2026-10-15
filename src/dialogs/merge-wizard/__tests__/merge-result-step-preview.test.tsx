import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { MergeResultStep } from '../merge-result-step';
import { mergeResultPreviewFixture } from '../merge-result-preview-fixture';
import type { MergeWizardApplyContext } from '../merge-wizard-apply-context';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) =>
            options
                ? `${key} ${Object.entries(options)
                      .map(([name, value]) => `${name}:${String(value)}`)
                      .join(' ')}`
                : key,
    }),
}));

const renderResultStep = (
    applyContext: MergeWizardApplyContext,
    onMerge = vi.fn()
) =>
    render(
        <ThemeProvider>
            <LocalConfigProvider>
                <Dialog open>
                    <DialogContent className="flex h-[800px] max-h-dvh w-[1200px] flex-col">
                        <MergeResultStep
                            applyContext={applyContext}
                            defaultSchema="public"
                            onBack={vi.fn()}
                            onMerge={onMerge}
                            isApplying={false}
                            applyError={null}
                            canApply
                        />
                    </DialogContent>
                </Dialog>
            </LocalConfigProvider>
        </ThemeProvider>
    );

describe('MergeResultStep preview integration', () => {
    it('renders two-column workspace with preview canvas', () => {
        const { applyContext } = mergeResultPreviewFixture();
        renderResultStep(applyContext);

        expect(screen.getByTestId('merge-wizard-result-step')).toHaveAttribute(
            'data-preview-workspace',
            'true'
        );
        expect(
            screen.getByTestId('merge-result-workspace')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('merge-result-changes-panel')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('merge-result-preview-panel')
        ).toBeInTheDocument();
        expect(screen.getByTestId('merge-preview-canvas')).toBeInTheDocument();
        expect(
            screen.getByText('merge_wizard.result.changes')
        ).toBeInTheDocument();
        expect(
            screen.getByText('merge_wizard.result.preview')
        ).toBeInTheDocument();
    });

    it('does not render preview workspace for zero differences', () => {
        const { applyContext } = mergeResultPreviewFixture();
        renderResultStep({
            ...applyContext,
            response: {
                ...applyContext.response,
                operations: [],
            },
        });

        expect(screen.getByTestId('merge-wizard-result-step')).toHaveAttribute(
            'data-preview-workspace',
            'false'
        );
        expect(
            screen.queryByTestId('merge-result-workspace')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('merge-preview-canvas')
        ).not.toBeInTheDocument();
    });

    it('removes added table from preview when table add is deselected', async () => {
        const user = userEvent.setup();
        const { applyContext } = mergeResultPreviewFixture();
        renderResultStep(applyContext);

        expect(screen.getByText('invoices')).toBeInTheDocument();

        const tableAddCheckbox = screen
            .getAllByRole('checkbox')
            .find((node) =>
                node.getAttribute('aria-label')?.includes('invoices')
            );
        expect(tableAddCheckbox).toBeTruthy();
        await user.click(tableAddCheckbox!);

        expect(screen.queryByText('invoices')).not.toBeInTheDocument();

        await user.click(tableAddCheckbox!);
        expect(screen.getByText('invoices')).toBeInTheDocument();
    });

    it('toggles rename decoration when field rename is deselected', async () => {
        const user = userEvent.setup();
        const { applyContext } = mergeResultPreviewFixture();
        renderResultStep(applyContext);

        expect(screen.getByText('full_name')).toBeInTheDocument();
        expect(
            document.querySelector('[data-merge-change="rename"]')
        ).toBeTruthy();

        const renameCheckbox = screen.getByRole('checkbox', {
            name: /full_name/,
        });
        await user.click(renameCheckbox);

        expect(screen.getByText('name')).toBeInTheDocument();
        expect(screen.queryByText('full_name')).not.toBeInTheDocument();
        const renameMarkers = document.querySelectorAll(
            '[data-merge-change="rename"]'
        );
        expect(renameMarkers.length).toBe(0);
    });

    it('toggles delete ghost when field delete is deselected', async () => {
        const user = userEvent.setup();
        const { applyContext } = mergeResultPreviewFixture();
        renderResultStep(applyContext);

        expect(screen.getByText('notes')).toBeInTheDocument();
        expect(
            document.querySelector('[data-merge-change="delete"]')
        ).toBeTruthy();

        const deleteCheckbox = screen.getByRole('checkbox', {
            name: /notes/,
        });
        await user.click(deleteCheckbox);

        expect(screen.getByText('notes')).toBeInTheDocument();
        expect(
            document.querySelector('[data-merge-change="delete"]')
        ).toBeNull();
    });

    it('shows base diagram without decorations when selection is empty', async () => {
        const user = userEvent.setup();
        const { applyContext, operationIds } = mergeResultPreviewFixture();
        const renameOnly = applyContext.response.operations.find(
            (operation) => operation.id === operationIds.renameField
        );
        expect(renameOnly).toBeTruthy();

        renderResultStep({
            ...applyContext,
            response: {
                ...applyContext.response,
                operations: renameOnly ? [renameOnly] : [],
            },
        });

        const renameCheckbox = screen.getByRole('checkbox', {
            name: /full_name/,
        });
        await user.click(renameCheckbox);

        expect(screen.getByText('name')).toBeInTheDocument();
        expect(screen.queryByText('full_name')).not.toBeInTheDocument();
        expect(document.querySelector('[data-merge-change]')).toBeNull();
        expect(
            screen.getByRole('button', { name: /merge_wizard.result.merge/ })
        ).toBeDisabled();
        expect(screen.getByTestId('merge-wizard-result-step')).toHaveAttribute(
            'data-selected-count',
            '0'
        );
    });

    it('passes only selected operation ids to onMerge, not preview state', async () => {
        const user = userEvent.setup();
        const onMerge = vi.fn();
        const { applyContext, operationIds } = mergeResultPreviewFixture();
        renderResultStep(applyContext, onMerge);

        const renameCheckbox = screen.getByRole('checkbox', {
            name: /full_name/,
        });
        await user.click(renameCheckbox);

        await user.click(
            screen.getByRole('button', {
                name: /merge_wizard.result.merge/,
            })
        );

        expect(onMerge).toHaveBeenCalledTimes(1);
        const payload = onMerge.mock.calls[0]?.[0] as string[];
        expect(payload).not.toContain(operationIds.renameField);
        expect(payload.every((id) => typeof id === 'string')).toBe(true);
    });

    it('uses a new preview when Compare generation changes', () => {
        const { applyContext } = mergeResultPreviewFixture();
        const first = renderResultStep(applyContext);
        expect(screen.getByText('invoices')).toBeInTheDocument();
        first.unmount();

        renderResultStep({
            ...applyContext,
            generation: applyContext.generation + 1,
            response: {
                ...applyContext.response,
                operations: applyContext.response.operations.slice(0, 1),
            },
        });

        expect(screen.queryByText('full_name')).not.toBeInTheDocument();
    });

    it('keeps preview mounted while Apply is pending', () => {
        const { applyContext } = mergeResultPreviewFixture();
        render(
            <ThemeProvider>
                <LocalConfigProvider>
                    <Dialog open>
                        <DialogContent className="flex h-[800px] flex-col">
                            <MergeResultStep
                                applyContext={applyContext}
                                defaultSchema="public"
                                onBack={vi.fn()}
                                onMerge={vi.fn()}
                                isApplying
                                applyError={null}
                                canApply
                            />
                        </DialogContent>
                    </Dialog>
                </LocalConfigProvider>
            </ThemeProvider>
        );

        expect(screen.getByTestId('merge-preview-canvas')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'merge_wizard.applying' })
        ).toBeDisabled();
    });
});
