import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '@/lib/api/client';
import type * as UploadCapabilitiesModule from '@/lib/upload-capabilities';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { UploadCapabilities } from '@/lib/upload-capabilities/types';
import { getProjectCandidateKey } from '@/lib/project-import/framework-labels';
import type { ProjectDetectionCandidate } from '@/lib/project-import/project-types';
import type {
    SchemaMergeSourcePreparationResult,
    SchemaMergeSourceResolution,
} from '@/lib/schema-merge/source-adapter-types';
import { ApiError } from '@/lib/api/client';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    readOnlineDiagramId,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';
import {
    initializeDiagramAutosaveFromServer,
    observeDiagramForAutosave,
    resetDiagramAutosaveForTests,
    setDiagramAutosaveEnabled,
} from '@/lib/diagram-autosave/diagram-autosave-controller';

const autosaveServerHash = 'f'.repeat(64);
import { MergeWizardDialog } from '../merge-wizard-dialog';

const closeMergeWizardDialog = vi.fn();

const chartState = {
    isAuthenticated: true,
    databaseType: DatabaseType.POSTGRESQL,
    replaceDiagram: vi.fn(),
    currentDiagram: {
        id: '42',
        name: 'Saved',
        databaseType: DatabaseType.POSTGRESQL,
        tables: [],
        relationships: [],
        createdAt: new Date(0),
        updatedAt: new Date(0),
    } as Diagram,
};

const locationState = {
    location: onlineDiagramLocation('42') as DiagramLocation,
};

const control = vi.hoisted(() => ({
    prepare: vi.fn(),
    apiRequest: vi.fn(),
    capabilities: null as UploadCapabilities | null,
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({ closeMergeWizardDialog }),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({ isAuthenticated: chartState.isAuthenticated }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => chartState,
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useDiagramLocation: () => ({
        location: locationState.location,
        setDiagramLocation: vi.fn(),
    }),
    useOnlineDiagramId: () =>
        readOnlineDiagramId(
            locationState.location,
            chartState.currentDiagram?.id
        ),
}));

vi.mock('@/components/code-snippet/code-snippet', () => ({
    CodeSnippet: ({
        code,
        editorProps,
    }: {
        code: string;
        editorProps?: {
            onChange?: (value: string) => void;
            options?: { ariaLabel?: string; readOnly?: boolean };
        };
    }) => (
        <textarea
            aria-label={editorProps?.options?.ariaLabel ?? 'code-editor'}
            value={code}
            disabled={editorProps?.options?.readOnly}
            onChange={(event) => {
                editorProps?.onChange?.(event.target.value);
            }}
        />
    ),
}));

vi.mock('@/lib/realtime/client-id', () => ({
    getClientId: () => 'client-1',
}));

vi.mock('@/lib/schema-merge/prepare-schema-merge-source', () => ({
    prepareSchemaMergeSource: (
        input: unknown,
        context: { resolution?: SchemaMergeSourceResolution }
    ) => control.prepare(input, context),
}));

vi.mock('@/lib/api/client', async () => {
    const actual = (await vi.importActual(
        '@/lib/api/client'
    )) as typeof ClientModule;

    return {
        ...actual,
        apiRequest: (...args: unknown[]) => control.apiRequest(...args),
    };
});

vi.mock('@/lib/upload-capabilities', async () => {
    const actual = (await vi.importActual(
        '@/lib/upload-capabilities'
    )) as typeof UploadCapabilitiesModule;

    return {
        ...actual,
        resolveUploadCapabilities: () =>
            Promise.resolve(
                control.capabilities ??
                    actual.CONSERVATIVE_UPLOAD_SAFETY_CEILING
            ),
    };
});

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

const hash = 'c'.repeat(64);

const incoming = {
    id: 'incoming',
    name: 'Incoming',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [],
    relationships: [],
    createdAt: new Date(0),
    updatedAt: new Date(0),
} as Diagram;

const readySql: SchemaMergeSourcePreparationResult = {
    status: 'ready',
    incomingDiagram: incoming,
    source: { kind: 'sql' },
    detectedFormat: 'sql',
    detectedFramework: null,
    detectedDatabaseType: DatabaseType.POSTGRESQL,
};

const emptyCompare = {
    baseContentHash: hash,
    baseUpdatedAt: '2026-01-01T00:00:00.000000Z',
    viewsCompared: true,
    operations: [],
};

const candidate = (
    framework: ProjectDetectionCandidate['framework'],
    rootPath: string
): ProjectDetectionCandidate => ({
    framework,
    rootPath,
    score: 10,
    confidence: 'high',
    evidence: [{ code: 'prisma_schema', weight: 1, path: rootPath }],
    relevantFiles: [`${rootPath}/prisma/schema.prisma`],
    parserLocation: 'local',
});

const prismaApp = candidate('prisma', 'apps/shop');
const laravelApp = candidate('laravel', 'services/billing');

let scenario: 'ready' | 'project' | 'groups' | 'dialect' = 'ready';

const renderWizard = (open = true) =>
    render(<MergeWizardDialog dialog={{ open }} />);

const paste = (value: string) => {
    fireEvent.change(
        screen.getByRole('textbox', { name: 'merge_wizard.source_label' }),
        {
            target: { value },
        }
    );
};

describe('Merge wizard shell', () => {
    beforeEach(() => {
        closeMergeWizardDialog.mockReset();
        chartState.replaceDiagram.mockReset();
        chartState.replaceDiagram.mockResolvedValue(undefined);
        resetDiagramAutosaveForTests();
        initializeDiagramAutosaveFromServer('42', autosaveServerHash);
        control.prepare.mockReset();
        control.apiRequest.mockReset();
        control.capabilities = null;
        scenario = 'ready';
        chartState.isAuthenticated = true;
        chartState.databaseType = DatabaseType.POSTGRESQL;
        chartState.currentDiagram = {
            id: '42',
            name: 'Saved',
            databaseType: DatabaseType.POSTGRESQL,
            tables: [],
            relationships: [],
            createdAt: new Date(0),
            updatedAt: new Date(0),
        } as Diagram;
        locationState.location = onlineDiagramLocation('42');
        control.prepare.mockImplementation(
            async (
                _input: unknown,
                context: { resolution?: SchemaMergeSourceResolution }
            ) => {
                if (
                    scenario === 'project' &&
                    !context.resolution?.projectCandidateKey
                ) {
                    return {
                        status: 'needs_project_resolution',
                        analysis: {
                            status: 'ambiguous',
                            candidates: [prismaApp, laravelApp],
                            recommendedCandidate: prismaApp,
                        },
                        candidates: [prismaApp, laravelApp],
                    } satisfies SchemaMergeSourcePreparationResult;
                }

                if (
                    scenario === 'dialect' &&
                    !context.resolution?.sourceDialect
                ) {
                    return {
                        status: 'needs_dialect_resolution',
                        analysis: {
                            format: { format: 'sql', confidence: 'high' },
                            dialect: null,
                            importMethod: null,
                            canContinue: false,
                            displayKind: 'sql_ambiguous',
                            severity: 'warning',
                            detectedDatabaseType: DatabaseType.POSTGRESQL,
                            resolutionState: 'ambiguous',
                            resolvedSourceDialect: null,
                            dialectCandidates: [
                                DatabaseType.POSTGRESQL,
                                DatabaseType.COCKROACHDB,
                            ],
                            dialectCandidateScores: [
                                {
                                    databaseType: DatabaseType.POSTGRESQL,
                                    score: 2,
                                    confidencePercent: 80,
                                },
                                {
                                    databaseType: DatabaseType.COCKROACHDB,
                                    score: 1,
                                    confidencePercent: 40,
                                },
                            ],
                            requiresExplicitSourceDialect: true,
                        },
                    } satisfies SchemaMergeSourcePreparationResult;
                }

                if (
                    scenario === 'groups' &&
                    !context.resolution?.databaseGroupId
                ) {
                    return {
                        status: 'needs_database_group_resolution',
                        sourceKind: 'prisma',
                        framework: 'prisma',
                        candidate: prismaApp,
                        analysis: {
                            status: 'multiple',
                            recommendedGroup: null,
                            groups: [
                                {
                                    id: 'billing',
                                    framework: 'prisma',
                                    label: 'Billing',
                                    rootPath: 'apps/shop',
                                    fileMappings: [],
                                    evidence: [],
                                    confidence: 'high',
                                },
                                {
                                    id: 'catalog',
                                    framework: 'prisma',
                                    label: 'Catalog',
                                    rootPath: 'apps/shop',
                                    fileMappings: [],
                                    evidence: [],
                                    confidence: 'high',
                                },
                            ],
                        },
                    } satisfies SchemaMergeSourcePreparationResult;
                }

                return readySql;
            }
        );
        control.apiRequest.mockResolvedValue(emptyCompare);
    });

    it('shows the source step and keeps Compare disabled until the source is ready', async () => {
        renderWizard();

        expect(
            screen.getByRole('heading', { name: 'merge_wizard.title' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'merge_wizard.compare' })
        ).toBeDisabled();
        expect(
            screen.queryByRole('button', { name: 'merge_wizard.back' })
        ).not.toBeInTheDocument();

        paste('select 1');

        await waitFor(() =>
            expect(
                screen.getByRole('button', { name: 'merge_wizard.compare' })
            ).toBeEnabled()
        );
    });

    it('posts the compare contract and stores an empty successful result', async () => {
        const user = userEvent.setup();
        renderWizard();
        paste('select 1');

        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);

        await screen.findByTestId('merge-wizard-result-step');
        expect(control.apiRequest).toHaveBeenCalledWith(
            '/diagrams/42/merge/compare',
            {
                method: 'POST',
                data: {
                    incomingDiagram: incoming,
                    includeDeletions: false,
                    source: { kind: 'sql' },
                },
            }
        );
        const result = screen.getByTestId('merge-wizard-result-step');
        expect(result).toHaveAttribute('data-operation-count', '0');
        expect(result).toHaveAttribute('data-base-hash', hash);
        expect(result).toHaveAttribute('data-include-deletions', 'false');
        expect(result).toHaveAttribute('data-source-kind', 'sql');
        expect(
            screen.queryByTestId('merge-wizard-source-step')
        ).not.toBeInTheDocument();
    });

    it('sends includeDeletions when the option is checked', async () => {
        const user = userEvent.setup();
        renderWizard();
        paste('select 1');

        const checkbox = screen.getByRole('checkbox', {
            name: 'merge_wizard.include_deletions.label',
        });
        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);
        expect(checkbox).toBeChecked();

        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);

        await screen.findByTestId('merge-wizard-result-step');
        expect(
            control.apiRequest.mock.calls[0]?.[1].data.includeDeletions
        ).toBe(true);
        expect(screen.getByTestId('merge-wizard-result-step')).toHaveAttribute(
            'data-include-deletions',
            'true'
        );
    });

    it('prevents a second compare while the first request is pending', async () => {
        let finish: (value: unknown) => void = () => undefined;
        control.apiRequest.mockImplementation(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                })
        );
        renderWizard();
        paste('select 1');
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());

        await act(async () => {
            compare.click();
            compare.click();
        });

        await waitFor(() =>
            expect(control.apiRequest).toHaveBeenCalledTimes(1)
        );
        expect(
            screen.getByRole('button', { name: 'merge_wizard.comparing' })
        ).toBeDisabled();
        expect(screen.getByRole('textbox')).toBeDisabled();

        await act(async () => {
            finish(emptyCompare);
        });
        await screen.findByTestId('merge-wizard-result-step');
    });

    it('maps compare failures to localized alerts', async () => {
        const user = userEvent.setup();
        const { ApiError } = await import('@/lib/api/client');
        control.apiRequest.mockRejectedValue(
            new ApiError('English backend message', 422, {
                code: 'malformed_diagram',
                message: 'English backend message',
            })
        );
        renderWizard();
        paste('select 1');
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);

        expect(
            await screen.findByText('merge_wizard.errors.malformed_diagram')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('English backend message')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('merge-wizard-result-step')
        ).not.toBeInTheDocument();
    });

    it('maps auth, permission, rate limit, and payload failures', async () => {
        const user = userEvent.setup();
        const { ApiError } = await import('@/lib/api/client');
        const cases = [
            [401, 'merge_wizard.errors.unauthenticated', 'Unauthenticated.'],
            [
                403,
                'merge_wizard.errors.forbidden',
                'This action is unauthorized.',
            ],
            [429, 'merge_wizard.errors.rate_limit', 'Too Many Attempts.'],
        ] as const;

        for (const [status, key, message] of cases) {
            control.apiRequest.mockRejectedValueOnce(
                new ApiError(message, status, { message })
            );
            const view = renderWizard();
            paste('select 1');
            const compare = await screen.findByRole('button', {
                name: 'merge_wizard.compare',
            });
            await waitFor(() => expect(compare).toBeEnabled());
            await user.click(compare);
            expect(await screen.findByText(key)).toBeInTheDocument();
            expect(screen.queryByText(message)).not.toBeInTheDocument();
            view.unmount();
        }

        control.apiRequest.mockClear();
        control.capabilities = {
            schema: { textMaxBytes: 5 },
            archive: {
                compressedMaxBytes: 5,
                uncompressedMaxBytes: 5,
                maxEntries: 1,
                maxEntryBytes: 5,
                maxPathLength: 8,
                maxDepth: 1,
            },
            projectImport: {
                maxFiles: 1,
                maxFileBytes: 5,
                maxTotalBytes: 5,
                maxPathLength: 8,
                maxPathDepth: 1,
            },
            laravelMigrationArchive: { maxBytes: 5 },
            schemaMerge: { payloadMaxBytes: 1 },
        };
        renderWizard();
        paste('select 1');
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);
        expect(
            await screen.findByText('merge_wizard.errors.payload_too_large')
        ).toBeInTheDocument();
        expect(control.apiRequest).not.toHaveBeenCalled();
    });

    it('resets source, deletions, and compare state when reopened', async () => {
        const user = userEvent.setup();
        const view = renderWizard();
        paste('select 1');
        await user.click(
            screen.getByRole('checkbox', {
                name: 'merge_wizard.include_deletions.label',
            })
        );
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);
        await screen.findByTestId('merge-wizard-result-step');

        view.rerender(<MergeWizardDialog dialog={{ open: false }} />);
        view.rerender(<MergeWizardDialog dialog={{ open: true }} />);

        expect(
            screen.getByTestId('merge-wizard-source-step')
        ).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveValue('');
        expect(
            screen.getByRole('checkbox', {
                name: 'merge_wizard.include_deletions.label',
            })
        ).not.toBeChecked();
        expect(
            screen.queryByTestId('merge-wizard-result-step')
        ).not.toBeInTheDocument();
    });

    it('does not compare a guest diagram', () => {
        chartState.currentDiagram = {
            ...chartState.currentDiagram,
            id: 'guest-diagram-1',
        };
        locationState.location = deviceDiagramLocation('guest-diagram-1');
        renderWizard();

        expect(
            screen.getByText('merge_wizard.unavailable')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'merge_wizard.compare' })
        ).toBeDisabled();
        expect(screen.getByRole('textbox')).toBeDisabled();
        expect(control.prepare).not.toHaveBeenCalled();
        expect(control.apiRequest).not.toHaveBeenCalled();
    });

    it('keeps Compare disabled until a project candidate is chosen', async () => {
        const user = userEvent.setup();
        scenario = 'project';
        renderWizard();
        paste('archive-placeholder');

        expect(
            await screen.findByText(
                'new_diagram_dialog.import_schema.project.multiple_projects_title'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'merge_wizard.compare' })
        ).toBeDisabled();

        await user.click(
            screen.getByRole('radio', { name: /frameworks\.laravel/ })
        );

        await waitFor(() =>
            expect(
                screen.getByRole('button', { name: 'merge_wizard.compare' })
            ).toBeEnabled()
        );
        expect(control.prepare).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                resolution: {
                    projectCandidateKey: getProjectCandidateKey(laravelApp),
                },
            })
        );
    });

    it('does not auto-select a database group', async () => {
        const user = userEvent.setup();
        scenario = 'groups';
        renderWizard();
        paste('archive-placeholder');

        expect(
            await screen.findByRole('radio', { name: /Billing/ })
        ).not.toBeChecked();
        expect(
            screen.getByRole('radio', { name: /Catalog/ })
        ).not.toBeChecked();
        expect(
            screen.getByRole('button', { name: 'merge_wizard.compare' })
        ).toBeDisabled();

        await user.click(screen.getByRole('radio', { name: /Catalog/ }));

        await waitFor(() =>
            expect(
                screen.getByRole('button', { name: 'merge_wizard.compare' })
            ).toBeEnabled()
        );
        expect(control.prepare).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                resolution: { databaseGroupId: 'catalog' },
            })
        );
        expect(control.prepare).not.toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                resolution: expect.objectContaining({
                    databaseGroupId: 'billing',
                }),
            })
        );
    });

    it('returns to the source and replaces the previous result on the next compare', async () => {
        const user = userEvent.setup();
        scenario = 'dialect';
        const first = {
            ...emptyCompare,
            operations: [
                {
                    id: 'opaque-first-operation',
                    category: 'field',
                    type: 'modify',
                    entityId: 'opaque-first-entity',
                    renameTo: null,
                    identity: {
                        kind: 'field',
                        schema: 'public',
                        table: 'users',
                        name: 'email',
                    },
                    before: null,
                    after: null,
                    changes: [],
                    dependsOn: [],
                },
            ],
        };
        const second = {
            ...emptyCompare,
            baseContentHash: 'd'.repeat(64),
            operations: [
                {
                    id: 'opaque-second-operation',
                    category: 'table',
                    type: 'add',
                    entityId: null,
                    renameTo: null,
                    identity: {
                        kind: 'table',
                        schema: 'public',
                        name: 'invoices',
                    },
                    before: null,
                    after: null,
                    changes: [],
                    dependsOn: [],
                },
            ],
        };
        control.apiRequest.mockResolvedValueOnce(first);
        renderWizard();
        paste('select 1');
        await user.click(
            screen.getByRole('checkbox', {
                name: 'merge_wizard.include_deletions.label',
            })
        );
        await user.click(
            await screen.findByRole('radio', { name: /CockroachDB/ })
        );

        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);
        const firstChange = await screen.findByRole('checkbox', {
            name: /users.email/,
        });
        expect(firstChange).toBeChecked();
        await user.click(firstChange);
        expect(firstChange).not.toBeChecked();

        await user.click(
            screen.getByRole('button', { name: 'new_diagram_dialog.back' })
        );

        expect(screen.getByTestId('merge-wizard-source-step')).toHaveAttribute(
            'data-cached-compare',
            'true'
        );
        expect(screen.getByTestId('merge-wizard-source-step')).toHaveAttribute(
            'data-source-dialect',
            DatabaseType.COCKROACHDB
        );
        expect(screen.getByRole('textbox')).toHaveValue('select 1');
        expect(
            screen.getByRole('checkbox', {
                name: 'merge_wizard.include_deletions.label',
            })
        ).toBeChecked();
        expect(control.apiRequest).toHaveBeenCalledTimes(1);

        control.apiRequest.mockResolvedValueOnce(second);
        const compareAgain = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compareAgain).toBeEnabled());
        await user.click(compareAgain);

        expect(
            await screen.findByText(
                'merge_wizard.result.entity.table name:invoices'
            )
        ).toBeInTheDocument();
        expect(screen.queryByText('users.email')).not.toBeInTheDocument();
        expect(
            screen.getByRole('checkbox', { name: /invoices/ })
        ).toBeChecked();
        expect(screen.getByTestId('merge-wizard-result-step')).toHaveAttribute(
            'data-base-hash',
            'd'.repeat(64)
        );
        expect(screen.getByTestId('merge-wizard-result-step')).toHaveAttribute(
            'data-include-deletions',
            'true'
        );
        expect(control.apiRequest).toHaveBeenCalledTimes(2);
        expect(control.prepare).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                resolution: { sourceDialect: DatabaseType.COCKROACHDB },
            })
        );
    });

    it('keeps a project resolution after returning from the result', async () => {
        const user = userEvent.setup();
        scenario = 'project';
        renderWizard();
        paste('archive-placeholder');
        await user.click(
            await screen.findByRole('radio', { name: /frameworks\.laravel/ })
        );
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);
        await screen.findByTestId('merge-wizard-result-step');
        await user.click(
            screen.getByRole('button', { name: 'new_diagram_dialog.back' })
        );

        expect(screen.getByTestId('merge-wizard-source-step')).toHaveAttribute(
            'data-project-candidate',
            getProjectCandidateKey(laravelApp)
        );
        expect(screen.getByTestId('merge-wizard-source-step')).toHaveAttribute(
            'data-cached-compare',
            'true'
        );
        expect(screen.getByRole('textbox')).toHaveValue('archive-placeholder');
    });

    it('keeps a database group resolution after returning from the result', async () => {
        const user = userEvent.setup();
        scenario = 'groups';
        renderWizard();
        paste('archive-placeholder');
        await user.click(await screen.findByRole('radio', { name: /Catalog/ }));
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);
        await screen.findByTestId('merge-wizard-result-step');
        await user.click(
            screen.getByRole('button', { name: 'new_diagram_dialog.back' })
        );

        expect(screen.getByTestId('merge-wizard-source-step')).toHaveAttribute(
            'data-database-group',
            'catalog'
        );
        expect(
            screen.getByRole('checkbox', {
                name: 'merge_wizard.include_deletions.label',
            })
        ).not.toBeChecked();
    });

    it('flushes autosave before Compare and does not compare when flush fails', async () => {
        const user = userEvent.setup();
        const saved = {
            ...chartState.currentDiagram,
            name: 'Saved',
        };
        const dirty = {
            ...saved,
            name: 'Unsaved edit',
        };
        setDiagramAutosaveEnabled(true);
        observeDiagramForAutosave(saved, { schedule: false });
        observeDiagramForAutosave(dirty, { schedule: true });
        control.apiRequest.mockRejectedValueOnce(new Error('save failed'));
        renderWizard();
        paste('select 1');
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);

        await screen.findByText('merge_wizard.errors.autosave_failed');
        expect(control.apiRequest).toHaveBeenCalledTimes(1);
        expect(control.apiRequest.mock.calls[0]?.[0]).toBe('/diagrams/42');
        expect(control.apiRequest.mock.calls[0]?.[1]).toEqual(
            expect.objectContaining({ method: 'PUT' })
        );
        expect(
            screen.getByTestId('merge-wizard-source-step')
        ).toBeInTheDocument();
    });

    it('does not start a second flush or Compare from one pending click', async () => {
        const user = userEvent.setup();
        const saved = { ...chartState.currentDiagram, name: 'Saved' };
        const dirty = { ...saved, name: 'Unsaved edit' };
        setDiagramAutosaveEnabled(true);
        observeDiagramForAutosave(saved, { schedule: false });
        observeDiagramForAutosave(dirty, { schedule: true });
        let releaseSave: () => void = () => undefined;
        const saveGate = new Promise<void>((resolve) => {
            releaseSave = resolve;
        });
        control.apiRequest.mockImplementation((path: string) => {
            if (path === '/diagrams/42') {
                return saveGate.then(() => ({
                    id: 42,
                    content_hash: autosaveServerHash,
                }));
            }

            return Promise.resolve(emptyCompare);
        });
        renderWizard();
        paste('select 1');
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);
        await user.click(compare);
        await waitFor(() =>
            expect(control.apiRequest).toHaveBeenCalledTimes(1)
        );
        expect(
            control.apiRequest.mock.calls.some((call) =>
                String(call[0]).includes('/merge/compare')
            )
        ).toBe(false);
        releaseSave();
        await screen.findByTestId('merge-wizard-result-step');
        expect(
            control.apiRequest.mock.calls.filter((call) =>
                String(call[0]).includes('/merge/compare')
            )
        ).toHaveLength(1);
    });

    it('persists the unsaved edit, applies the selection, and closes', async () => {
        const user = userEvent.setup();
        const saved = { ...chartState.currentDiagram, name: 'Saved' };
        const dirty = { ...saved, name: 'Unsaved edit' };
        setDiagramAutosaveEnabled(true);
        observeDiagramForAutosave(saved, { schedule: false });
        observeDiagramForAutosave(dirty, { schedule: true });
        const hash = 'e'.repeat(64);
        const resultHash = 'f'.repeat(64);
        const merged = {
            id: '42',
            name: 'Saved',
            databaseType: DatabaseType.POSTGRESQL,
            tables: [
                {
                    id: 'backendtableid00000000001',
                    name: 'invoices',
                    x: 480,
                    y: 80,
                    fields: [],
                    indexes: [],
                    color: '#8eb7ff',
                    isView: false,
                    createdAt: 0,
                },
            ],
            relationships: [],
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
        };
        control.apiRequest.mockImplementation(
            (path: string, options?: { method?: string }) => {
                if (options?.method === 'PUT') {
                    return Promise.resolve({
                        id: 42,
                        content_hash: autosaveServerHash,
                    });
                }

                if (String(path).endsWith('/merge/compare')) {
                    return Promise.resolve({
                        baseContentHash: hash,
                        baseUpdatedAt: null,
                        viewsCompared: true,
                        operations: [
                            {
                                id: 'keep-me',
                                category: 'table',
                                type: 'add',
                                entityId: null,
                                renameTo: null,
                                identity: {
                                    kind: 'table',
                                    schema: null,
                                    name: 'invoices',
                                },
                                before: null,
                                after: null,
                                changes: [],
                                dependsOn: [],
                            },
                            {
                                id: 'drop-me',
                                category: 'table',
                                type: 'add',
                                entityId: null,
                                renameTo: null,
                                identity: {
                                    kind: 'table',
                                    schema: null,
                                    name: 'legacy',
                                },
                                before: null,
                                after: null,
                                changes: [],
                                dependsOn: [],
                            },
                        ],
                    });
                }

                return Promise.resolve({
                    resultContentHash: resultHash,
                    updatedAt: '2026-01-02T00:00:00.000Z',
                    content: merged,
                    appliedOperationIds: ['keep-me'],
                    summary: {
                        selected: 1,
                        categories: {
                            table: 1,
                            field: 0,
                            relationship: 0,
                            view: 0,
                        },
                        types: { add: 1, modify: 0, rename: 0, delete: 0 },
                    },
                });
            }
        );
        renderWizard();
        paste('select 1');
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);
        await screen.findByTestId('merge-wizard-result-step');
        const putIndex = control.apiRequest.mock.calls.findIndex(
            (call) => call[1]?.method === 'PUT'
        );
        const compareIndex = control.apiRequest.mock.calls.findIndex((call) =>
            String(call[0]).includes('/merge/compare')
        );
        expect(putIndex).toBeGreaterThanOrEqual(0);
        expect(compareIndex).toBeGreaterThan(putIndex);
        expect(
            control.apiRequest.mock.calls[putIndex]?.[1].data.content.name
        ).toBe('Unsaved edit');

        const drop = screen.getByRole('checkbox', {
            name: /legacy/,
        });
        await user.click(drop);
        await user.click(
            screen.getByRole('button', { name: /merge_wizard.result.merge/ })
        );
        await waitFor(() =>
            expect(chartState.replaceDiagram).toHaveBeenCalledTimes(1)
        );
        const applyCall = control.apiRequest.mock.calls.find((call) =>
            String(call[0]).includes('/merge/apply')
        );
        expect(applyCall?.[0]).toBe('/diagrams/42/merge/apply');
        expect(applyCall?.[1].data).toEqual(
            expect.objectContaining({
                baseContentHash: hash,
                includeDeletions: false,
                source: { kind: 'sql' },
                selectedOperationIds: ['keep-me'],
                clientId: 'client-1',
            })
        );
        expect(applyCall?.[1].data).not.toHaveProperty('operations');
        expect(applyCall?.[1].data).not.toHaveProperty('dependsOn');
        expect(applyCall?.[1].data).not.toHaveProperty('currentDiagram');
        expect(chartState.replaceDiagram).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '42',
                tables: [
                    expect.objectContaining({
                        id: 'backendtableid00000000001',
                        x: 480,
                    }),
                ],
            }),
            {
                updateHistory: true,
                authoritative: true,
                authoritativeContentHash: resultHash,
            }
        );
        expect(closeMergeWizardDialog).toHaveBeenCalled();
        expect(
            control.apiRequest.mock.calls.filter((call) =>
                String(call[0]).includes('/merge/compare')
            )
        ).toHaveLength(1);
    });

    it('returns to Compare again when Apply is stale and does not replace the diagram', async () => {
        const user = userEvent.setup();
        const hash = 'a'.repeat(64);
        control.apiRequest.mockImplementation((path: string) => {
            if (String(path).endsWith('/merge/compare')) {
                return Promise.resolve({
                    ...emptyCompare,
                    baseContentHash: hash,
                    operations: [
                        {
                            id: 'keep-me',
                            category: 'table',
                            type: 'modify',
                            entityId: 'users',
                            renameTo: null,
                            identity: {
                                kind: 'table',
                                schema: null,
                                name: 'users',
                            },
                            before: null,
                            after: null,
                            changes: [],
                            dependsOn: [],
                        },
                    ],
                });
            }

            return Promise.reject(
                new ApiError('stale', 409, { code: 'stale_comparison' })
            );
        });
        renderWizard();
        paste('select 1');
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);
        await screen.findByTestId('merge-wizard-result-step');
        await user.click(
            screen.getByRole('button', { name: /merge_wizard.result.merge/ })
        );
        await screen.findByText('merge_wizard.errors.stale_comparison');
        expect(
            screen.getByTestId('merge-wizard-source-step')
        ).toBeInTheDocument();
        expect(chartState.replaceDiagram).not.toHaveBeenCalled();
        expect(
            screen.queryByRole('checkbox', { name: /users/ })
        ).not.toBeInTheDocument();
    });

    it('requires a fresh Compare when Apply reports an incomplete selection', async () => {
        const user = userEvent.setup();
        const hash = 'b'.repeat(64);
        control.apiRequest.mockImplementation((path: string) => {
            if (String(path).endsWith('/merge/compare')) {
                return Promise.resolve({
                    ...emptyCompare,
                    baseContentHash: hash,
                    operations: [
                        {
                            id: 'keep-me',
                            category: 'table',
                            type: 'modify',
                            entityId: 'users',
                            renameTo: null,
                            identity: {
                                kind: 'table',
                                schema: null,
                                name: 'users',
                            },
                            before: null,
                            after: null,
                            changes: [],
                            dependsOn: [],
                        },
                    ],
                });
            }

            return Promise.reject(
                new ApiError('incomplete', 422, {
                    code: 'incomplete_selection',
                })
            );
        });
        renderWizard();
        paste('select 1');
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);
        await screen.findByTestId('merge-wizard-result-step');
        await user.click(
            screen.getByRole('button', { name: /merge_wizard.result.merge/ })
        );
        await screen.findByText('merge_wizard.errors.incomplete_selection');
        expect(
            screen.getByTestId('merge-wizard-source-step')
        ).toBeInTheDocument();
        expect(chartState.replaceDiagram).not.toHaveBeenCalled();
    });

    it('keeps the review when Apply is rate limited or analysis fails', async () => {
        const user = userEvent.setup();
        const hash = 'c'.repeat(64);
        const compareBody = {
            ...emptyCompare,
            baseContentHash: hash,
            operations: [
                {
                    id: 'keep-me',
                    category: 'table',
                    type: 'modify',
                    entityId: 'users',
                    renameTo: null,
                    identity: { kind: 'table', schema: null, name: 'users' },
                    before: null,
                    after: null,
                    changes: [],
                    dependsOn: [],
                },
            ],
        };

        control.apiRequest.mockImplementation((path: string) => {
            if (String(path).endsWith('/merge/compare')) {
                return Promise.resolve(compareBody);
            }

            return Promise.reject(new ApiError('limited', 429, {}));
        });
        const { unmount } = renderWizard();
        paste('select 1');
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);
        await screen.findByTestId('merge-wizard-result-step');
        await user.click(
            screen.getByRole('button', { name: /merge_wizard.result.merge/ })
        );
        await screen.findByText('merge_wizard.apply_errors.rate_limit');
        expect(
            screen.getByTestId('merge-wizard-result-step')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /merge_wizard.result.merge/ })
        ).toBeEnabled();
        expect(chartState.replaceDiagram).not.toHaveBeenCalled();
        unmount();

        control.apiRequest.mockImplementation((path: string) => {
            if (String(path).endsWith('/merge/compare')) {
                return Promise.resolve(compareBody);
            }

            return Promise.reject(
                new ApiError('failed', 422, { code: 'analysis_failed' })
            );
        });
        renderWizard();
        paste('select 1');
        const compareAgain = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compareAgain).toBeEnabled());
        await user.click(compareAgain);
        await screen.findByTestId('merge-wizard-result-step');
        await user.click(
            screen.getByRole('button', { name: /merge_wizard.result.merge/ })
        );
        await screen.findByText('merge_wizard.apply_errors.analysis_failed');
        expect(
            screen.getByTestId('merge-wizard-result-step')
        ).toBeInTheDocument();
        expect(chartState.replaceDiagram).not.toHaveBeenCalled();
    });

    it('does not start a second Apply while the first request is pending', async () => {
        const user = userEvent.setup();
        const hash = 'd'.repeat(64);
        let release: (() => void) | undefined;
        control.apiRequest.mockImplementation((path: string) => {
            if (String(path).endsWith('/merge/compare')) {
                return Promise.resolve({
                    ...emptyCompare,
                    baseContentHash: hash,
                    operations: [
                        {
                            id: 'keep-me',
                            category: 'table',
                            type: 'modify',
                            entityId: 'users',
                            renameTo: null,
                            identity: {
                                kind: 'table',
                                schema: null,
                                name: 'users',
                            },
                            before: null,
                            after: null,
                            changes: [],
                            dependsOn: [],
                        },
                    ],
                });
            }

            return new Promise((resolve) => {
                release = () =>
                    resolve({
                        resultContentHash: hash,
                        updatedAt: null,
                        content: chartState.currentDiagram,
                        appliedOperationIds: ['keep-me'],
                        summary: {
                            selected: 1,
                            categories: {
                                table: 1,
                                field: 0,
                                relationship: 0,
                                view: 0,
                            },
                            types: {
                                add: 0,
                                modify: 1,
                                rename: 0,
                                delete: 0,
                            },
                        },
                    });
            });
        });
        renderWizard();
        paste('select 1');
        const compare = await screen.findByRole('button', {
            name: 'merge_wizard.compare',
        });
        await waitFor(() => expect(compare).toBeEnabled());
        await user.click(compare);
        await screen.findByTestId('merge-wizard-result-step');
        const merge = screen.getByRole('button', {
            name: /merge_wizard.result.merge/,
        });
        await user.click(merge);
        await screen.findByRole('button', { name: 'merge_wizard.applying' });
        await user.click(
            screen.getByRole('button', { name: 'merge_wizard.applying' })
        );
        expect(
            control.apiRequest.mock.calls.filter((call) =>
                String(call[0]).includes('/merge/apply')
            )
        ).toHaveLength(1);
        release?.();
        await waitFor(() =>
            expect(chartState.replaceDiagram).toHaveBeenCalledTimes(1)
        );
    });

    it('closes from Cancel', async () => {
        const user = userEvent.setup();
        renderWizard();
        await user.click(
            screen.getByRole('button', { name: 'merge_wizard.cancel' })
        );
        expect(closeMergeWizardDialog).toHaveBeenCalledTimes(1);
    });
});
