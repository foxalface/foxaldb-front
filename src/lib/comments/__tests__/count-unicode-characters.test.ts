import { describe, expect, it } from 'vitest';
import { countUnicodeCharacters } from '../count-unicode-characters';

describe('countUnicodeCharacters', () => {
    it('counts ASCII characters', () => {
        expect(countUnicodeCharacters('hello')).toBe(5);
        expect(countUnicodeCharacters('')).toBe(0);
    });

    it('counts accented characters as single code points', () => {
        expect(countUnicodeCharacters('café')).toBe(4);
        expect(countUnicodeCharacters('naïve')).toBe(5);
    });

    it('counts CJK characters as single code points', () => {
        expect(countUnicodeCharacters('日本語')).toBe(3);
        expect(countUnicodeCharacters('你好')).toBe(2);
    });

    it('counts emoji as their code points (not grapheme clusters)', () => {
        // U+1F600 as a single code point
        expect(countUnicodeCharacters('😀')).toBe(1);
        // Two separate emoji code points
        expect(countUnicodeCharacters('😀😀')).toBe(2);
    });

    it('counts combining sequences by code point', () => {
        // e + combining acute accent (U+0301) = 2 code points
        expect(countUnicodeCharacters('e\u0301')).toBe(2);
        // a + combining diaeresis = 2 code points
        expect(countUnicodeCharacters('a\u0308')).toBe(2);
    });

    it('counts ZWJ sequences by code point, not grapheme cluster', () => {
        // Family emoji: 👨 U+200D 👩 U+200D 👧 = 5 code points
        const family = '👨\u200D👩\u200D👧';
        expect(countUnicodeCharacters(family)).toBe(5);

        // Woman technologist: 👩 U+200D 💻 = 3 code points
        const technologist = '👩\u200D💻';
        expect(countUnicodeCharacters(technologist)).toBe(3);
    });
});
