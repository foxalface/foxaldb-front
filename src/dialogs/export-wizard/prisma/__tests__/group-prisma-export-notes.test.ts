import { describe, expect, it } from 'vitest';
import type { PrismaExportNote } from '@/lib/api/prisma-export-types';
import {
    countGroupedPrismaExportNote,
    groupPrismaExportNotes,
} from '../group-prisma-export-notes';

const note = (
    code: PrismaExportNote['code'],
    overrides: Partial<PrismaExportNote> = {}
): PrismaExportNote => ({
    code,
    message: `${code} message`,
    ...overrides,
});

describe('groupPrismaExportNotes', () => {
    it('groups repeated relation_skipped notes', () => {
        const grouped = groupPrismaExportNotes([
            note('relation_skipped', { path: 'rel-1' }),
            note('relation_skipped', { path: 'rel-2' }),
            note('relation_skipped', { path: 'rel-3' }),
        ]);

        expect(grouped).toHaveLength(1);
        expect(grouped[0]?.notes).toHaveLength(3);
        expect(countGroupedPrismaExportNote(grouped[0]!)).toBe(3);
    });

    it('keeps distinct schema namespace groups separate', () => {
        const grouped = groupPrismaExportNotes([
            note('schema_namespace_unsupported', {
                path: 'public',
                metadata: { count: 2 },
            }),
            note('schema_namespace_unsupported', {
                path: 'auth',
                metadata: { count: 3 },
            }),
        ]);

        expect(grouped).toHaveLength(2);
        expect(grouped[0]?.notes[0]?.path).toBe('public');
        expect(grouped[1]?.notes[0]?.path).toBe('auth');
    });

    it('keeps different note codes distinct', () => {
        const grouped = groupPrismaExportNotes([
            note('relation_skipped'),
            note('composite_fk_unsupported'),
        ]);

        expect(grouped).toHaveLength(2);
        expect(grouped.map((group) => group.code)).toEqual([
            'relation_skipped',
            'composite_fk_unsupported',
        ]);
    });

    it('preserves original diagnostic notes in grouped output', () => {
        const original = note('relation_skipped', {
            path: 'diagram_members.user_id -> users.id',
            message:
                'Referenced field is not a primary key or unique constraint.',
        });

        const grouped = groupPrismaExportNotes([original]);

        expect(grouped[0]?.notes[0]).toEqual(original);
    });
});
