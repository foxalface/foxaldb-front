import { describe, expect, it } from 'vitest';
import { nextDiagramCopyName } from '../next-diagram-copy-name';

describe('nextDiagramCopyName', () => {
    it('starts at (1) for the first copy', () => {
        expect(nextDiagramCopyName('Main', ['Main'])).toBe('Main (1)');
    });

    it('increments past the highest existing index', () => {
        expect(nextDiagramCopyName('Main', ['Main', 'Main (1)', 'Other'])).toBe(
            'Main (2)'
        );
    });

    it('treats a numbered source as the same base name', () => {
        expect(nextDiagramCopyName('Main (1)', ['Main', 'Main (1)'])).toBe(
            'Main (2)'
        );
    });

    it('does not fill gaps', () => {
        expect(nextDiagramCopyName('Main', ['Main (1)', 'Main (4)'])).toBe(
            'Main (5)'
        );
    });
});
