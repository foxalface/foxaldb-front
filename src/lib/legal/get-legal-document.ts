import { englishLegalNotice, frenchLegalNotice } from './legal-notice';
import { englishPrivacyPolicy, frenchPrivacyPolicy } from './privacy-policy';
import { englishTerms, frenchTerms } from './terms-of-use';
import {
    legalBodyLanguage,
    type LegalBodyLanguage,
    type LegalDocument,
    type LegalDocumentId,
} from './legal-document';

const documents: Record<
    LegalBodyLanguage,
    Record<LegalDocumentId, () => LegalDocument>
> = {
    fr: {
        notice: frenchLegalNotice,
        privacy: frenchPrivacyPolicy,
        terms: frenchTerms,
    },
    en: {
        notice: englishLegalNotice,
        privacy: englishPrivacyPolicy,
        terms: englishTerms,
    },
};

export const getLegalDocument = (
    id: LegalDocumentId,
    locale: string
): LegalDocument => documents[legalBodyLanguage(locale)][id]();

export const legalDocumentIds: readonly LegalDocumentId[] = [
    'notice',
    'privacy',
    'terms',
];
