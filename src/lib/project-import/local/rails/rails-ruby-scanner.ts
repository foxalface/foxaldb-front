export class RailsRubyScanner {
    constructor(private readonly source: string) {}

    findMatchingDelimiter(
        openIndex: number,
        openChar: string,
        closeChar: string
    ): number {
        let depth = 0;

        for (let index = openIndex; index < this.source.length; index += 1) {
            if (this.isEscaped(index)) {
                continue;
            }

            const char = this.source[index];

            if (char === '#') {
                index = this.skipLineComment(index);
                continue;
            }

            if (this.isStringStart(char)) {
                index = this.skipString(index);
                continue;
            }

            if (char === openChar) {
                depth += 1;
            } else if (char === closeChar) {
                depth -= 1;
                if (depth === 0) {
                    return index;
                }
            }
        }

        return -1;
    }

    findMatchingDoEnd(doIndex: number): number {
        let depth = 0;
        let index = doIndex;

        while (index < this.source.length) {
            if (this.isEscaped(index)) {
                index += 1;
                continue;
            }

            const char = this.source[index];

            if (char === '#') {
                index = this.skipLineComment(index) + 1;
                continue;
            }

            if (this.isStringStart(char)) {
                index = this.skipString(index) + 1;
                continue;
            }

            if (this.isWordAt(index, 'do')) {
                depth += 1;
                index += 2;
                continue;
            }

            if (this.isWordAt(index, 'end')) {
                depth -= 1;
                if (depth === 0) {
                    return index;
                }
                index += 3;
                continue;
            }

            index += 1;
        }

        return -1;
    }

    extractBalanced(
        openIndex: number,
        openChar: string,
        closeChar: string
    ): string | null {
        const closeIndex = this.findMatchingDelimiter(
            openIndex,
            openChar,
            closeChar
        );

        if (closeIndex === -1) {
            return null;
        }

        return this.source.slice(openIndex + 1, closeIndex);
    }

    private isWordAt(index: number, word: string): boolean {
        if (!this.source.startsWith(word, index)) {
            return false;
        }

        const before = this.source[index - 1];
        const after = this.source[index + word.length];

        const isBoundary = (char: string | undefined): boolean =>
            char === undefined || /[\s,;()]/.test(char);

        return isBoundary(before) && isBoundary(after);
    }

    private isEscaped(index: number): boolean {
        let slashCount = 0;
        let cursor = index - 1;

        while (cursor >= 0 && this.source[cursor] === '\\') {
            slashCount += 1;
            cursor -= 1;
        }

        return slashCount % 2 === 1;
    }

    private isStringStart(char: string): boolean {
        return char === '"' || char === "'";
    }

    private skipString(startIndex: number): number {
        const quote = this.source[startIndex];
        let index = startIndex + 1;

        while (index < this.source.length) {
            const char = this.source[index];

            if (char === '\\') {
                index += 2;
                continue;
            }

            if (char === quote) {
                return index;
            }

            index += 1;
        }

        return this.source.length - 1;
    }

    private skipLineComment(startIndex: number): number {
        let index = startIndex + 1;

        while (index < this.source.length && this.source[index] !== '\n') {
            index += 1;
        }

        return index;
    }
}
