/**
 * Count Unicode code points (matches Laravel `max:2000` / mb_strlen),
 * not UTF-16 code units and not grapheme clusters.
 */
export const countUnicodeCharacters = (value: string): number =>
    Array.from(value).length;
