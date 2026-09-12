import { describe, expect, it } from 'vitest';
import { appendSchemaNamespaceNotes } from '../append-schema-namespace-notes';
import type { PrismaExportNote } from '../prisma-export-types';
import { makeField, makeTable, typeRef } from './test-helpers';

describe('appendSchemaNamespaceNotes', () => {
    it('emits one note for a single table with schema', () => {
        const notes: PrismaExportNote[] = [];

        appendSchemaNamespaceNotes(
            [
                makeTable({
                    name: 'users',
                    schema: 'auth',
                    fields: [
                        makeField({
                            name: 'id',
                            type: typeRef('integer'),
                            primaryKey: true,
                        }),
                    ],
                }),
            ],
            notes
        );

        expect(notes).toHaveLength(1);
        expect(notes[0]?.metadata?.count).toBe(1);
        expect(notes[0]?.path).toBe('auth');
    });

    it('groups tables with the same schema into one note', () => {
        const notes: PrismaExportNote[] = [];

        const tables = Array.from({ length: 11 }, (_, index) =>
            makeTable({
                name: `table_${index + 1}`,
                schema: 'foxaldb',
                fields: [
                    makeField({
                        name: 'id',
                        type: typeRef('bigint'),
                        primaryKey: true,
                    }),
                ],
            })
        );

        appendSchemaNamespaceNotes(tables, notes);

        expect(notes).toHaveLength(1);
        expect(notes[0]?.metadata?.count).toBe(11);
        expect(notes[0]?.metadata?.affectedPaths).toHaveLength(11);
    });

    it('emits separate notes for distinct schemas in deterministic order', () => {
        const notes: PrismaExportNote[] = [];

        appendSchemaNamespaceNotes(
            [
                makeTable({
                    name: 'users',
                    schema: 'public',
                    fields: [
                        makeField({
                            name: 'id',
                            type: typeRef('integer'),
                            primaryKey: true,
                        }),
                    ],
                }),
                makeTable({
                    name: 'accounts',
                    schema: 'auth',
                    fields: [
                        makeField({
                            name: 'id',
                            type: typeRef('integer'),
                            primaryKey: true,
                        }),
                    ],
                }),
            ],
            notes
        );

        expect(notes.map((note) => note.path)).toEqual(['auth', 'public']);
    });

    it('emits no notes when schema metadata is absent', () => {
        const notes: PrismaExportNote[] = [];

        appendSchemaNamespaceNotes(
            [
                makeTable({
                    name: 'users',
                    fields: [
                        makeField({
                            name: 'id',
                            type: typeRef('integer'),
                            primaryKey: true,
                        }),
                    ],
                }),
            ],
            notes
        );

        expect(notes).toHaveLength(0);
    });
});
