import { describe, expect, it } from 'vitest';
import { COMMENT_TARGET_TYPES } from '../comment-types';

describe('COMMENT_TARGET_TYPES', () => {
    it('contains exactly the four expected target types', () => {
        expect(COMMENT_TARGET_TYPES).toEqual([
            'diagram',
            'table',
            'field',
            'relationship',
        ]);
    });

    it('has no duplicates', () => {
        expect(new Set(COMMENT_TARGET_TYPES).size).toBe(
            COMMENT_TARGET_TYPES.length
        );
    });
});
