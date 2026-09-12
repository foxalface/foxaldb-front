import type {
    PrismaExportNote,
    PrismaExportNoteCode,
} from '@/lib/prisma-export';

export interface GroupedPrismaExportNote {
    code: PrismaExportNoteCode;
    notes: PrismaExportNote[];
}

const groupKeyForNote = (note: PrismaExportNote): string => {
    if (note.code === 'schema_namespace_unsupported') {
        return `${note.code}:${note.path ?? ''}`;
    }

    return note.code;
};

export const groupPrismaExportNotes = (
    notes: PrismaExportNote[]
): GroupedPrismaExportNote[] => {
    const groups = new Map<string, PrismaExportNote[]>();
    const keyOrder: string[] = [];

    for (const note of notes) {
        const key = groupKeyForNote(note);
        const group = groups.get(key);

        if (group) {
            group.push(note);
            continue;
        }

        groups.set(key, [note]);
        keyOrder.push(key);
    }

    return keyOrder.map((key) => {
        const groupedNotes = groups.get(key) ?? [];

        return {
            code: groupedNotes[0]?.code ?? 'relation_skipped',
            notes: groupedNotes,
        };
    });
};

export const countGroupedPrismaExportNote = (
    group: GroupedPrismaExportNote
): number => {
    if (group.code === 'schema_namespace_unsupported') {
        return group.notes.reduce(
            (total, note) => total + (note.metadata?.count ?? 1),
            0
        );
    }

    return group.notes.length;
};
