import type { railsExportNoteMessages } from './en';

type StringifyLeaves<T> = T extends string
    ? string
    : T extends Record<string, unknown>
      ? { [K in keyof T]: StringifyLeaves<T[K]> }
      : never;

export type RailsExportNoteMessages = StringifyLeaves<
    typeof railsExportNoteMessages
>;
