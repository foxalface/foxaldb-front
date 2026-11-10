export const ENGLISH_LEGAL_PRECEDENCE_NOTICE =
    'This English version is provided for information only. In case of conflict, the French version prevails.';

export type LegalBodyLanguage = 'fr' | 'en';

export type LegalDocumentId = 'notice' | 'privacy' | 'terms';

export type LegalInline =
    | { kind: 'text'; text: string }
    | { kind: 'internal'; href: string; label: string }
    | { kind: 'external'; href: string; label: string };

export type LegalBlock =
    | { kind: 'paragraph'; parts: LegalInline[] }
    | { kind: 'list'; items: LegalInline[][] };

export interface LegalSection {
    id: string;
    title: string;
    blocks: LegalBlock[];
    subsections?: LegalSection[];
}

export interface LegalDocument {
    id: LegalDocumentId;
    language: LegalBodyLanguage;
    title: string;
    versionNote?: string;
    showEnglishPrecedence: boolean;
    sections: LegalSection[];
}

export const legalBodyLanguage = (locale: string): LegalBodyLanguage => {
    const base = locale.trim().toLowerCase().replaceAll('_', '-').split('-')[0];

    return base === 'fr' ? 'fr' : 'en';
};

export const text = (value: string): LegalInline => ({
    kind: 'text',
    text: value,
});

export const internalLink = (href: string, label: string): LegalInline => ({
    kind: 'internal',
    href,
    label,
});

export const externalLink = (href: string, label: string): LegalInline => ({
    kind: 'external',
    href,
    label,
});

export const paragraph = (
    ...parts: Array<string | LegalInline>
): LegalBlock => ({
    kind: 'paragraph',
    parts: parts.map((part) => (typeof part === 'string' ? text(part) : part)),
});

export const bullets = (
    ...items: Array<string | LegalInline[]>
): LegalBlock => ({
    kind: 'list',
    items: items.map((item) =>
        typeof item === 'string' ? [text(item)] : item
    ),
});

export const section = (
    id: string,
    title: string,
    blocks: LegalBlock[],
    subsections?: LegalSection[]
): LegalSection => ({
    id,
    title,
    blocks,
    subsections,
});
