export const LEGAL_PATHS = {
    notice: '/legal',
    privacy: '/privacy',
    terms: '/terms',
} as const;

export type LegalPath = (typeof LEGAL_PATHS)[keyof typeof LEGAL_PATHS];

export const LEGAL_APP_LINK_REL = 'noopener noreferrer';
