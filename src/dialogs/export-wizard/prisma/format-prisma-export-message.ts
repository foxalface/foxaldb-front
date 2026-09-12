import type { TFunction } from 'i18next';
import type {
    PrismaExportError,
    PrismaExportNote,
} from '@/lib/api/prisma-export-types';
import type { GroupedPrismaExportNote } from './group-prisma-export-notes';
import { countGroupedPrismaExportNote } from './group-prisma-export-notes';

export const formatPrismaExportError = (
    error: PrismaExportError,
    t: TFunction
): string => {
    const key = `export_wizard.prisma.preview_step.errors.${error.code}`;
    const translated = t(key);

    if (translated !== key) {
        return translated;
    }

    return (
        error.message || t('export_wizard.prisma.preview_step.generation_error')
    );
};

export const formatPrismaExportNote = (
    note: PrismaExportNote,
    t: TFunction
): string => {
    const key = `export_wizard.prisma.preview_step.notes.${note.code}`;
    const translated = t(key);

    if (translated !== key) {
        return translated;
    }

    return note.message;
};

export const formatGroupedPrismaExportNote = (
    group: GroupedPrismaExportNote,
    t: TFunction
): string => {
    const count = countGroupedPrismaExportNote(group);

    if (count <= 1) {
        return formatPrismaExportNote(group.notes[0], t);
    }

    const groupedKey = `export_wizard.prisma.preview_step.notes_grouped.${group.code}`;
    const groupedTranslation = t(groupedKey, { count });

    if (groupedTranslation !== groupedKey) {
        return groupedTranslation;
    }

    const fallbackKey =
        'export_wizard.prisma.preview_step.notes_grouped.with_count';
    const fallbackTranslation = t(fallbackKey, {
        message: formatPrismaExportNote(group.notes[0], t),
        count,
    });

    if (fallbackTranslation !== fallbackKey) {
        return fallbackTranslation;
    }

    return `${formatPrismaExportNote(group.notes[0], t)} (${count})`;
};
