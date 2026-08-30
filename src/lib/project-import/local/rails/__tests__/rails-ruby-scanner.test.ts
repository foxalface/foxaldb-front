import { describe, expect, it } from 'vitest';
import { RailsRubyScanner } from '../rails-ruby-scanner';

describe('RailsRubyScanner', () => {
    it('does not treat do inside strings as block delimiters', () => {
        const source = 'outer do inner "has do inside" end';
        const scanner = new RailsRubyScanner(source);
        const outerDo = source.indexOf('outer') + 'outer '.length;

        expect(scanner.findMatchingDoEnd(outerDo)).toBe(
            source.lastIndexOf('end')
        );
    });

    it('matches nested do/end blocks', () => {
        const source = 'outer do inner do x end end';
        const scanner = new RailsRubyScanner(source);
        const outerDo = source.indexOf('outer') + 'outer '.length;

        expect(scanner.findMatchingDoEnd(outerDo)).toBe(
            source.lastIndexOf('end')
        );
    });

    it('matches balanced parentheses inside strings with braces', () => {
        const source = 'args("{ not a paren }")';
        const scanner = new RailsRubyScanner(source);
        const open = source.indexOf('(');

        expect(scanner.findMatchingDelimiter(open, '(', ')')).toBe(
            source.lastIndexOf(')')
        );
    });

    it('skips line comments', () => {
        const source = '# do\nactual do end';
        const scanner = new RailsRubyScanner(source);
        const doIndex = source.lastIndexOf('do');

        expect(scanner.findMatchingDoEnd(doIndex)).toBe(
            source.lastIndexOf('end')
        );
    });
});
