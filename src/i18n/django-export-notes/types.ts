import type { djangoExportNoteMessages } from './en';

type StringifyLeaves<T> = T extends string
    ? string
    : T extends Record<string, unknown>
      ? { [K in keyof T]: StringifyLeaves<T[K]> }
      : never;

export type DjangoExportNoteMessages = StringifyLeaves<
    typeof djangoExportNoteMessages
>;
