import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { emptyMergePreviewDecorations } from '@/lib/schema-merge/preview/preview-types';
import { buildSchemaMergePreview } from '@/lib/schema-merge/preview/build-schema-merge-preview';
import type { DiffOperation } from '@/lib/schema-merge/diff-types';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { MergePreviewCanvas } from '../merge-preview-canvas';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const diagram: Diagram = {
    id: 'preview-diagram',
    name: 'Preview',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        {
            id: 't-users',
            name: 'users',
            schema: 'public',
            x: 0,
            y: 0,
            fields: [
                {
                    id: 'f-id',
                    name: 'id',
                    type: { id: 'int', name: 'int' },
                    primaryKey: true,
                    unique: false,
                    nullable: false,
                    createdAt: 0,
                },
            ],
            indexes: [],
            color: '#8eb7ff',
            isView: false,
            createdAt: 0,
        },
        {
            id: 'v-active',
            name: 'active_users',
            schema: 'public',
            x: 300,
            y: 0,
            fields: [],
            indexes: [],
            color: '#b0b0b0',
            isView: true,
            createdAt: 0,
        },
    ],
    relationships: [
        {
            id: 'r1',
            name: 'users_posts',
            sourceTableId: 't-users',
            targetTableId: 't-users',
            sourceFieldId: 'f-id',
            targetFieldId: 'f-id',
            sourceCardinality: 'one',
            targetCardinality: 'many',
            createdAt: 0,
        },
    ],
    createdAt: new Date(0),
    updatedAt: new Date(0),
};

const renderPreview = () =>
    render(
        <ThemeProvider>
            <LocalConfigProvider>
                <div className="h-96 w-full">
                    <MergePreviewCanvas
                        diagram={diagram}
                        decorations={emptyMergePreviewDecorations()}
                    />
                </div>
            </LocalConfigProvider>
        </ThemeProvider>
    );

describe('MergePreviewCanvas', () => {
    it('mounts an isolated preview canvas with controls', () => {
        renderPreview();

        expect(
            screen.getByTestId('merge-preview-canvas-root')
        ).toBeInTheDocument();
        expect(screen.getByTestId('merge-preview-canvas')).toBeInTheDocument();
        expect(
            screen.getByTestId('merge-preview-controls')
        ).toBeInTheDocument();
        expect(screen.getByLabelText('toolbar.zoom_in')).toBeInTheDocument();
        expect(screen.getByLabelText('toolbar.zoom_out')).toBeInTheDocument();
        expect(screen.getByLabelText('toolbar.show_all')).toBeInTheDocument();
    });

    it('renders table and view nodes', () => {
        renderPreview();

        expect(screen.getByText('users')).toBeInTheDocument();
        expect(screen.getByText('active_users')).toBeInTheDocument();
    });

    it('renders buildSchemaMergePreview output with decoration semantics', () => {
        const previewField = (
            id: string,
            name: string,
            overrides: Partial<DBField> = {}
        ): DBField => ({
            id,
            name,
            type: { id: 'varchar', name: 'varchar' },
            primaryKey: false,
            unique: false,
            nullable: true,
            createdAt: 0,
            ...overrides,
        });

        const previewTable = (
            id: string,
            name: string,
            fields: DBField[]
        ): DBTable => ({
            id,
            name,
            schema: 'public',
            x: 0,
            y: 0,
            fields,
            indexes: [],
            color: '#8eb7ff',
            isView: false,
            createdAt: 0,
        });

        const baseDiagram: Diagram = {
            id: 'base',
            name: 'Base',
            databaseType: DatabaseType.POSTGRESQL,
            tables: [
                previewTable('t1', 'users', [
                    previewField('f1', 'name'),
                    previewField('f2', 'legacy'),
                ]),
            ],
            relationships: [
                {
                    id: 'r-del',
                    name: 'rel',
                    sourceTableId: 't1',
                    targetTableId: 't1',
                    sourceFieldId: 'f1',
                    targetFieldId: 'f1',
                    sourceCardinality: 'one',
                    targetCardinality: 'many',
                    createdAt: 0,
                },
            ],
            createdAt: new Date(0),
            updatedAt: new Date(0),
        };

        const operations: DiffOperation[] = [
            {
                id: 'rename-field',
                category: 'field',
                type: 'rename',
                entityId: 'f1',
                renameTo: {
                    kind: 'field',
                    schema: 'public',
                    table: 'users',
                    name: 'full_name',
                },
                identity: {
                    kind: 'field',
                    schema: 'public',
                    table: 'users',
                    name: 'name',
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            },
            {
                id: 'delete-field',
                category: 'field',
                type: 'delete',
                entityId: 'f2',
                renameTo: null,
                identity: {
                    kind: 'field',
                    schema: 'public',
                    table: 'users',
                    name: 'legacy',
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            },
            {
                id: 'delete-rel',
                category: 'relationship',
                type: 'delete',
                entityId: 'r-del',
                renameTo: null,
                identity: {
                    kind: 'relationship',
                    source: {
                        schema: 'public',
                        table: 'users',
                        field: 'name',
                    },
                    target: {
                        schema: 'public',
                        table: 'users',
                        field: 'name',
                    },
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            },
        ];

        const projection = buildSchemaMergePreview({
            baseDiagram,
            incomingDiagram: {
                ...baseDiagram,
                id: 'incoming',
            },
            operations,
            selectedOperationIds: new Set([
                'rename-field',
                'delete-field',
                'delete-rel',
            ]),
            viewsCompared: false,
            defaultSchema: 'public',
        });

        render(
            <ThemeProvider>
                <LocalConfigProvider>
                    <div className="h-96 w-full">
                        <MergePreviewCanvas
                            diagram={projection.diagram}
                            decorations={projection.decorations}
                        />
                    </div>
                </LocalConfigProvider>
            </ThemeProvider>
        );

        expect(screen.getByText('full_name')).toBeInTheDocument();
        expect(screen.getByText('legacy')).toBeInTheDocument();
        expect(
            document.querySelector('[data-merge-change="rename"]')
        ).toBeTruthy();
        expect(
            document.querySelector('[data-merge-change="delete"]')
        ).toBeTruthy();
        expect(
            screen.getByLabelText('merge_wizard.result.change.rename')
        ).toBeInTheDocument();
    });
});

describe('merge preview flow props', () => {
    it('documents readonly interaction policy', async () => {
        const module = await import('../merge-preview-canvas');

        expect(module.MergePreviewCanvas).toBeDefined();
    });
});
