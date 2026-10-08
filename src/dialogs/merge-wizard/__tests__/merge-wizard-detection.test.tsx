import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as UploadCapabilitiesModule from '@/lib/upload-capabilities';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import {
    dbmlSample,
    mysqlDistinctiveSql,
    postgresDistinctiveSql,
} from '@/lib/import/__tests__/fixtures/import-samples';
import { FLEXIBLE_PRISMA_SCHEMA } from '@/lib/project-import/__tests__/fixtures/flexible-layout-fixtures';
import { createTestZipFile } from '@/lib/project-import/__tests__/fixtures/build-test-zip';
import { MergeWizardDialog } from '../merge-wizard-dialog';

const chartState = {
    isAuthenticated: true,
    databaseType: DatabaseType.POSTGRESQL,
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

const control = vi.hoisted(() => ({
    resolveUploadCapabilities: vi.fn(),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({ closeMergeWizardDialog: vi.fn() }),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({ isAuthenticated: chartState.isAuthenticated }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => chartState,
}));

vi.mock('@/lib/upload-capabilities', async () => {
    const actual = (await vi.importActual(
        '@/lib/upload-capabilities'
    )) as typeof UploadCapabilitiesModule;

    control.resolveUploadCapabilities.mockImplementation(() =>
        Promise.resolve(actual.CONSERVATIVE_UPLOAD_SAFETY_CEILING)
    );

    return {
        ...actual,
        resolveUploadCapabilities: control.resolveUploadCapabilities,
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

const diagramJson = JSON.stringify({
    id: 'diagram',
    name: 'Imported',
    databaseType: 'postgresql',
    tables: [
        {
            id: '1',
            name: 'users',
            x: 0,
            y: 0,
            fields: [
                {
                    id: '2',
                    name: 'id',
                    type: { id: 'int', name: 'int' },
                    primaryKey: true,
                    unique: true,
                    nullable: false,
                    createdAt: 1,
                },
            ],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 1,
        },
    ],
    relationships: [],
});

const competingSql = `
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    legacy_id INT AUTO_INCREMENT,
    payload JSONB
);
`;

const fileInput = (): HTMLInputElement => {
    const input = document.body.querySelector('input[type="file"]');

    if (!(input instanceof HTMLInputElement)) {
        throw new Error('Missing file input');
    }

    return input;
};

const paste = (value: string) => {
    fireEvent.change(
        screen.getByRole('textbox', { name: 'merge_wizard.source_label' }),
        { target: { value } }
    );
};

describe('Merge wizard source detection', () => {
    beforeEach(() => {
        control.resolveUploadCapabilities.mockClear();
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
    });

    it('shows a PostgreSQL summary for pasted SQL', async () => {
        render(<MergeWizardDialog dialog={{ open: true }} />);
        paste(postgresDistinctiveSql);

        expect(
            await screen.findByText(
                'new_diagram_dialog.import_schema.detection.dialect database:PostgreSQL'
            )
        ).toBeInTheDocument();
        expect(control.resolveUploadCapabilities).toHaveBeenCalled();
        expect(
            screen.queryByText('entity_framework_core')
        ).not.toBeInTheDocument();
    });

    it('shows a DBML summary', async () => {
        render(<MergeWizardDialog dialog={{ open: true }} />);
        paste(dbmlSample);

        expect(
            await screen.findByText(
                'new_diagram_dialog.import_schema.detection.dbml'
            )
        ).toBeInTheDocument();
    });

    it('shows a diagram JSON summary', async () => {
        render(<MergeWizardDialog dialog={{ open: true }} />);
        paste(diagramJson);

        expect(
            await screen.findByText(
                'new_diagram_dialog.import_schema.detection.diagram_json'
            )
        ).toBeInTheDocument();
    });

    it('shows a Prisma project summary for a ZIP', async () => {
        const user = userEvent.setup();
        render(<MergeWizardDialog dialog={{ open: true }} />);

        await user.upload(
            fileInput(),
            createTestZipFile({
                'prisma/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
            })
        );

        expect(
            await screen.findByText(
                /new_diagram_dialog\.import_schema\.project\.detected framework:new_diagram_dialog\.import_schema\.project\.frameworks\.prisma/
            )
        ).toBeInTheDocument();
        expect(
            screen.queryByText('entity_framework_core')
        ).not.toBeInTheDocument();
    });

    it('replaces the active source when pasting after a file and when choosing a file after text', async () => {
        const user = userEvent.setup();
        render(<MergeWizardDialog dialog={{ open: true }} />);
        paste(postgresDistinctiveSql);
        await screen.findByText(
            'new_diagram_dialog.import_schema.detection.dialect database:PostgreSQL'
        );

        await user.upload(
            fileInput(),
            new File([dbmlSample], 'schema.dbml', { type: 'text/plain' })
        );

        await waitFor(() =>
            expect(screen.getByRole('textbox')).toHaveValue('')
        );
        expect(
            screen.getByRole('button', {
                name: 'merge_wizard.change_file_aria name:schema.dbml',
            })
        ).toBeInTheDocument();
        expect(
            await screen.findByText(
                'new_diagram_dialog.import_schema.detection.dbml'
            )
        ).toBeInTheDocument();

        paste(postgresDistinctiveSql);
        expect(
            screen.getByRole('button', { name: 'merge_wizard.choose_file' })
        ).toBeInTheDocument();
        expect(
            await screen.findByText(
                'new_diagram_dialog.import_schema.detection.dialect database:PostgreSQL'
            )
        ).toBeInTheDocument();
    });

    it('requires an explicit dialect before Compare and blocks a database mismatch', async () => {
        const user = userEvent.setup();
        const view = render(<MergeWizardDialog dialog={{ open: true }} />);
        paste(competingSql);

        expect(
            await screen.findByText(
                'new_diagram_dialog.import_schema.detection.sql_ambiguous_title'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'merge_wizard.compare' })
        ).toBeDisabled();

        await user.click(screen.getByRole('radio', { name: /PostgreSQL/ }));
        await waitFor(() =>
            expect(
                screen.getByRole('button', { name: 'merge_wizard.compare' })
            ).toBeEnabled()
        );

        view.unmount();
        render(<MergeWizardDialog dialog={{ open: true }} />);
        paste(mysqlDistinctiveSql);
        expect(
            await screen.findByText(
                /import_database_dialog\.import_schema\.mismatch\.title/
            )
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'merge_wizard.compare' })
        ).toBeDisabled();
        expect(
            screen.queryByRole('button', { name: /switch/i })
        ).not.toBeInTheDocument();
    });
});
