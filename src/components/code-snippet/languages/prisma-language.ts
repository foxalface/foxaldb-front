import type { Monaco } from '@monaco-editor/react';

let isPrismaLanguageSetup = false;

const PRISMA_KEYWORDS = [
    'model',
    'enum',
    'generator',
    'datasource',
    'type',
    'view',
];

const PRISMA_TYPES = [
    'String',
    'Boolean',
    'Int',
    'BigInt',
    'Float',
    'Decimal',
    'DateTime',
    'Json',
    'Bytes',
];

export const setupPrismaLanguage = (monaco: Monaco) => {
    if (isPrismaLanguageSetup) {
        return;
    }

    isPrismaLanguageSetup = true;

    monaco.languages.register({ id: 'prisma' });

    monaco.editor.defineTheme('prisma-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '6A9955' },
            { token: 'keyword', foreground: 'C586C0' },
            { token: 'type', foreground: '4EC9B0' },
            { token: 'attribute', foreground: 'DCDCAA' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'number', foreground: 'B5CEA8' },
            { token: 'delimiter', foreground: 'D4D4D4' },
            { token: 'identifier', foreground: '9CDCFE' },
        ],
        colors: {},
    });

    monaco.editor.defineTheme('prisma-light', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '008000' },
            { token: 'keyword', foreground: 'AF00DB' },
            { token: 'type', foreground: '267F99' },
            { token: 'attribute', foreground: '795E26' },
            { token: 'string', foreground: 'A31515' },
            { token: 'number', foreground: '098658' },
            { token: 'delimiter', foreground: '000000' },
            { token: 'identifier', foreground: '001080' },
        ],
        colors: {},
    });

    monaco.languages.setLanguageConfiguration('prisma', {
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
        ],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"', notIn: ['string'] },
        ],
        comments: {
            lineComment: '//',
        },
    });

    monaco.languages.setMonarchTokensProvider('prisma', {
        keywords: PRISMA_KEYWORDS,
        types: PRISMA_TYPES,

        tokenizer: {
            root: [
                [/\/\/.*$/, 'comment'],
                [/\/\/\/.*$/, 'comment'],
                [/\b(model|enum|generator|datasource|type|view)\b/, 'keyword'],
                [
                    /\b(String|Boolean|Int|BigInt|Float|Decimal|DateTime|Json|Bytes)\b/,
                    'type',
                ],
                [/@@?[a-zA-Z_]\w*/, 'attribute'],
                [/"([^"\\]|\\.)*$/, 'string.invalid'],
                [/"/, 'string', '@string_double'],
                [/[{}()[\]]/, 'delimiter'],
                [/[=:]/, 'delimiter'],
                [/\d+/, 'number'],
                [/[a-zA-Z_]\w*/, 'identifier'],
            ],
            string_double: [
                [/[^\\"]+/, 'string'],
                [/\\./, 'string.escape'],
                [/"/, 'string', '@pop'],
            ],
        },
    });
};
