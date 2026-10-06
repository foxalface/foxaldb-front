/**
 * Limits applied while a ZIP is inspected in the browser.
 * Callers supply the values. This module does not own numeric defaults.
 */
export interface ArchiveLimits {
    readonly compressedMaxBytes: number;
    readonly uncompressedMaxBytes: number;
    readonly maxEntries: number;
    readonly maxEntryBytes: number;
    readonly maxPathLength: number;
    readonly maxDepth: number;
}
