/**
 * Centralized legal identity for the public pages.
 *
 * TODO: Replace every unresolved placeholder before public production launch.
 * Do not invent operator identity, address, hosting, transactional email
 * provider, retention periods, or domain. Mailpit is development-only and
 * must not be published as the production email provider.
 *
 * A future rename from FoxalDB to DBDraft should start in this file
 * (`serviceName`, and `sourceCodeUrl` if the public repository moves).
 *
 * `termsVersion` is intentionally not defined here. The accepted version is
 * `FOXALDB_TERMS_VERSION` / `config('foxaldb.terms_version')`, stored by the
 * backend when registration succeeds. `legalLastUpdated` is only the date
 * shown on these pages. Keep that date aligned with the backend version, and
 * update both before public launch if these documents are still drafts.
 */

export const legalConfig = {
    serviceName: 'FoxalDB',
    domain: '[DOMAINE]',
    operatorIdentity: '[IDENTITÉ_EXPLOITANT]',
    legalStatus: '[STATUT_JURIDIQUE]',
    sirenSiret: '[SIREN_SIRET]',
    registration: '[IMMATRICULATION_SI_APPLICABLE]',
    vatNumber: '[TVA_SI_APPLICABLE]',
    operatorAddress: '[ADRESSE]',
    supportEmail: '[EMAIL_SUPPORT]',
    privacyEmail: '[EMAIL_PRIVACY]',
    phone: '[TÉLÉPHONE]',
    publicationDirector: '[DIRECTEUR_PUBLICATION]',
    hostingProvider: '[HÉBERGEUR]',
    hostingLegalName: '[RAISON_SOCIALE_HÉBERGEUR]',
    hostingAddress: '[ADRESSE_HÉBERGEUR]',
    hostingPhone: '[TÉLÉPHONE_HÉBERGEUR]',
    transactionalEmailProvider: '[FOURNISSEUR_EMAIL]',
    invitationRetention: '[CONSERVATION_INVITATIONS]',
    activityRetention: '[CONSERVATION_ACTIVITÉ]',
    logRetention: '[CONSERVATION_LOGS]',
    failedJobRetention: '[CONSERVATION_FAILED_JOBS]',
    backupRetention: '[CONSERVATION_SAUVEGARDES]',
    emailProviderRetention: '[CONSERVATION_FOURNISSEUR_EMAIL]',
    /**
     * Public AGPL frontend repository (origin: foxalface/foxaldb-front).
     * This is not the private Laravel backend.
     */
    sourceCodeUrl: 'https://github.com/foxalface/foxaldb-front',
    legalLastUpdated: '2026-11-10',
} as const;

export type LegalConfig = typeof legalConfig;

export type UnresolvedLegalField =
    | 'domain'
    | 'operatorIdentity'
    | 'legalStatus'
    | 'sirenSiret'
    | 'registration'
    | 'vatNumber'
    | 'operatorAddress'
    | 'supportEmail'
    | 'privacyEmail'
    | 'phone'
    | 'publicationDirector'
    | 'hostingProvider'
    | 'hostingLegalName'
    | 'hostingAddress'
    | 'hostingPhone'
    | 'transactionalEmailProvider'
    | 'invitationRetention'
    | 'activityRetention'
    | 'logRetention'
    | 'failedJobRetention'
    | 'backupRetention'
    | 'emailProviderRetention';

/** Fields that must stay visibly unresolved until production facts exist. */
export const unresolvedLegalFields = [
    'domain',
    'operatorIdentity',
    'legalStatus',
    'sirenSiret',
    'registration',
    'vatNumber',
    'operatorAddress',
    'supportEmail',
    'privacyEmail',
    'phone',
    'publicationDirector',
    'hostingProvider',
    'hostingLegalName',
    'hostingAddress',
    'hostingPhone',
    'transactionalEmailProvider',
    'invitationRetention',
    'activityRetention',
    'logRetention',
    'failedJobRetention',
    'backupRetention',
    'emailProviderRetention',
] as const satisfies readonly UnresolvedLegalField[];

const PLACEHOLDER_PATTERN = /^\[[^[\]]+\]$/;

export const isExplicitLegalPlaceholder = (value: string): boolean =>
    PLACEHOLDER_PATTERN.test(value);

let unresolvedLegalWarningShown = false;

/**
 * Dev-only console warning. Production builds and automated tests stay quiet.
 * This is not shown in the page UI.
 */
export const warnUnresolvedLegalPlaceholders = (): void => {
    if (
        unresolvedLegalWarningShown ||
        !import.meta.env.DEV ||
        import.meta.env.MODE === 'test'
    ) {
        return;
    }

    unresolvedLegalWarningShown = true;
    console.warn(
        `[legal] Replace unresolved placeholders before public production launch: ${unresolvedLegalFields.join(', ')}`
    );
};
