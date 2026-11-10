import { legalConfig } from './legal-config';
import {
    bullets,
    externalLink,
    internalLink,
    paragraph,
    section,
    text,
    type LegalDocument,
} from './legal-document';

const service = legalConfig.serviceName;

export const frenchTerms = (): LegalDocument => ({
    id: 'terms',
    language: 'fr',
    title: 'Conditions générales d’utilisation',
    versionNote: 'Version bêta',
    showEnglishPrecedence: false,
    sections: [
        section('purpose', `À quoi sert ${service} ?`, [
            bullets(
                'concevoir et modifier des schémas de base de données',
                'importer des schémas lorsque c’est pris en charge',
                'enregistrer des diagrammes Online',
                'partager',
                'collaborer',
                'exporter ou générer des migrations lorsque la fonction est disponible'
            ),
            paragraph(
                'Certaines fonctions marchent sans compte. D’autres demandent un compte.'
            ),
        ]),
        section('beta', 'Version bêta', [
            bullets(
                'Le produit évolue.',
                'Des fonctions peuvent changer.',
                'Des bugs peuvent rester.',
                'Une maintenance peut interrompre le service.',
                'Aucun niveau de service précis n’est promis, sauf accord séparé.'
            ),
            paragraph(
                'Ces points ne retirent pas les droits impératifs prévus par la loi.'
            ),
        ]),
        section('acceptance', 'Acceptation des CGU', [
            bullets(
                'La création d’un compte exige d’accepter ces conditions.',
                'Cela vaut pour une inscription directe et pour une inscription depuis une invitation.',
                'La politique de confidentialité est une information. Ce n’est pas un consentement marketing.',
                'Une modification importante future des conditions pourra demander une information ou une nouvelle acceptation.'
            ),
            paragraph(
                'Ouvrir une invitation, ou cocher la case à l’avance, ne vaut pas acceptation. La case n’est pas pré-cochée.'
            ),
        ]),
        section('no-account', 'Utilisation sans compte', [
            paragraph('Les diagrammes Device :'),
            bullets(
                'sont stockés localement dans le navigateur',
                'ne sont pas sauvegardés automatiquement par le service',
                'peuvent être perdus si le navigateur ou l’appareil est effacé',
                'ne peuvent pas être restaurés par le service s’ils n’ont jamais été envoyés'
            ),
        ]),
        section('account', 'Votre compte', [
            paragraph('Vous êtes responsable :'),
            bullets(
                'des informations exactes',
                'de la sécurité de votre mot de passe',
                'de l’accès à votre e-mail',
                'de l’usage ordinaire du compte'
            ),
            paragraph(
                `En cas de compromission, contactez ${legalConfig.supportEmail}.`
            ),
        ]),
        section('ownership', 'Vos diagrammes vous appartiennent', [
            paragraph('Vous conservez vos droits sur vos diagrammes.'),
            paragraph('Vous accordez seulement une licence technique pour :'),
            bullets(
                'le stockage',
                'le traitement',
                'la sauvegarde',
                'la synchronisation',
                'la transmission aux collaborateurs autorisés'
            ),
            paragraph('Cette licence est :'),
            bullets(
                'non exclusive',
                'sans transfert de propriété',
                'sans revente séparée',
                'sans entraînement d’IA, sauf accord distinct'
            ),
        ]),
        section(
            'imported-content',
            'Vous êtes responsable du contenu que vous importez',
            [
                bullets(
                    'Vous devez avoir les droits nécessaires.',
                    'N’importez pas de données que vous n’êtes pas autorisé à traiter.',
                    'Évitez les mots de passe.',
                    'Évitez les clés d’API.',
                    'Évitez les secrets de production.',
                    'Évitez les données personnelles inutiles.'
                ),
            ]
        ),
        section(
            'professional',
            'Données professionnelles et contrat de sous-traitance',
            [
                paragraph(
                    'Un client professionnel peut être responsable de traitement pour les données personnelles de ses diagrammes. Le service peut alors être sous-traitant, uniquement sur instruction du client.'
                ),
                paragraph(
                    'Lorsque la loi l’exige, un contrat article 28 sera proposé plus tard. Il n’est pas inclus dans cette version.'
                ),
            ]
        ),
        section('sharing', 'Partage et collaboration', [
            paragraph('Le propriétaire peut :'),
            bullets(
                'inviter',
                'attribuer un rôle',
                'donner ou retirer un accès'
            ),
            paragraph('Une invitation :'),
            bullets(
                'ne crée pas automatiquement un compte',
                'ne donne pas automatiquement l’accès',
                'demande une acceptation explicite, selon le parcours actuel du produit'
            ),
        ]),
        section('prohibited', 'Ce qui est interdit', [
            bullets(
                'un usage illégal',
                'la violation des droits d’un tiers',
                'un accès non autorisé',
                'le contournement de la sécurité',
                'les attaques ou perturbations',
                'les logiciels malveillants',
                'le spam',
                'l’automatisation abusive',
                'un comportement qui menace la sécurité'
            ),
        ]),
        section('report', 'Signalement d’un contenu illicite', [
            paragraph(`Écrivez à ${legalConfig.supportEmail}.`),
            paragraph('Un signalement utile indique si possible :'),
            bullets(
                'le contenu ou le diagramme',
                'l’emplacement ou le lien',
                'la raison',
                'les informations qui aident à le traiter'
            ),
            paragraph(
                'Une mesure adaptée peut être prise. Lorsque la loi l’exige, les raisons vous sont données.'
            ),
        ]),
        section('delete-diagram', 'Suppression d’un diagramme Online', [
            bullets(
                'Il devient inaccessible immédiatement.',
                'Il peut être restauré pendant 90 jours.',
                'Il est ensuite supprimé des systèmes actifs.',
                'Ce n’est pas un remplacement de votre propre sauvegarde.'
            ),
        ]),
        section('delete-account', 'Suppression de votre compte', [
            bullets(
                'L’accès s’arrête immédiatement.',
                'Les sessions sont invalidées.',
                'Le compte peut être restauré pendant 90 jours.',
                'L’adresse e-mail reste réservée.',
                'Les diagrammes Online fermés avec le compte sont indisponibles, puis récupérables pendant ce délai.'
            ),
            paragraph('Si vous restaurez le compte :'),
            bullets(
                'c’est le même compte',
                'les diagrammes fermés avec le compte reviennent',
                'les suppressions manuelles déjà faites restent supprimées',
                'les anciennes sessions ne se réactivent pas'
            ),
            paragraph('Après 90 jours :'),
            bullets(
                'les données sont effacées des systèmes actifs',
                'l’adresse e-mail peut être réutilisée',
                'un nouveau compte est une nouvelle identité',
                'les anciennes données ne sont pas restaurées automatiquement'
            ),
        ]),
        section('erasure', 'Droit à l’effacement', [
            paragraph(
                'Le délai de 90 jours ne bloque pas un effacement applicable. Une demande validée peut déclencher un effacement définitif plus tôt. La restauration devient alors impossible. Des données exigées par la loi peuvent encore être conservées.'
            ),
        ]),
        section('availability', 'Disponibilité et sauvegardes', [
            bullets(
                'Un service en ligne peut tomber en panne.',
                'Des maintenances ont lieu.',
                'Des bugs existent.',
                'Les sauvegardes ne sont pas infaillibles.',
                'Exportez les diagrammes importants lorsque c’est possible.'
            ),
        ]),
        section('open-source', 'Open source et AGPL', [
            bullets(
                'L’interface repose sur un fork de ChartDB.',
                'ChartDB est sous GNU AGPL v3.',
                [
                    text('Le code source correspondant est disponible à '),
                    externalLink(
                        legalConfig.sourceCodeUrl,
                        legalConfig.sourceCodeUrl
                    ),
                    text('.'),
                ],
                'Les droits open source sont indépendants de ces conditions.',
                'Vos diagrammes ne deviennent pas AGPL parce que vous utilisez le service.'
            ),
        ]),
        section('suspension', 'Suspension du service ou d’un compte', [
            paragraph('Une suspension peut intervenir en cas de :'),
            bullets(
                'abus',
                'attaque',
                'fraude',
                'risque de sécurité',
                'contenu illicite',
                'violation grave des conditions',
                'obligation légale'
            ),
            paragraph(
                'Vous êtes informé lorsque c’est approprié ou exigé par la loi.'
            ),
        ]),
        section('liability', 'Responsabilité', [
            paragraph(
                'Le service n’est pas responsable des conséquences directement causées par :'
            ),
            bullets(
                'les données que vous saisissez',
                'un partage vers le mauvais destinataire',
                'la perte d’un contenu présent seulement sur l’appareil',
                'des secrets ou mots de passe que vous avez volontairement placés dans un diagramme',
                'un usage contraire aux conditions'
            ),
            paragraph(
                'Nous n’écartons pas une responsabilité que la loi ne nous permet pas d’écarter.'
            ),
        ]),
        section('privacy', 'Données personnelles', [
            paragraph(
                'Le traitement des données personnelles est décrit dans la ',
                internalLink('/privacy', 'politique de confidentialité'),
                '.'
            ),
        ]),
        section('paid', 'Offre payante', [
            paragraph(
                'Ces conditions régissent l’usage général actuel. Avant une offre payante, des conditions commerciales adaptées seront ajoutées, y compris lorsque c’est applicable :'
            ),
            bullets(
                'le prix',
                'la facturation',
                'le renouvellement',
                'la résiliation',
                'les droits de rétractation',
                'la médiation de la consommation'
            ),
        ]),
        section('changes', 'Modification des CGU', [
            paragraph(
                'Les conditions peuvent être modifiées. Une modification importante pourra être signalée et, si nécessaire, demander une nouvelle acceptation.'
            ),
        ]),
        section('law', 'Droit applicable', [
            paragraph(
                'Le droit français s’applique. Les protections impératives des consommateurs ne sont pas écartées.'
            ),
        ]),
        section('contact', 'Contact', [
            bullets(
                `Support : ${legalConfig.supportEmail}`,
                `Vie privée : ${legalConfig.privacyEmail}`
            ),
        ]),
    ],
});

export const englishTerms = (): LegalDocument => ({
    id: 'terms',
    language: 'en',
    title: 'Terms of use',
    versionNote: 'Beta version',
    showEnglishPrecedence: true,
    sections: [
        section('purpose', `What is ${service} for?`, [
            bullets(
                'design and edit database schemas',
                'import schemas where that is supported',
                'save Online diagrams',
                'share',
                'collaborate',
                'export or generate migrations where the feature is available'
            ),
            paragraph(
                'Some features work without an account. Others require one.'
            ),
        ]),
        section('beta', 'Beta version', [
            bullets(
                'The product is still evolving.',
                'Features may change.',
                'Bugs may remain.',
                'Maintenance may interrupt the service.',
                'No specific service level is promised unless it is agreed separately.'
            ),
            paragraph('None of this removes mandatory rights granted by law.'),
        ]),
        section('acceptance', 'Acceptance of the Terms', [
            bullets(
                'Creating an account requires acceptance of these Terms.',
                'That applies to a normal registration and to registration from an invitation.',
                'The Privacy Policy is information. It is not marketing consent.',
                'A material future change to the Terms may require notice or a new acceptance.'
            ),
            paragraph(
                'Opening an invitation, or finding the box already checked, is not acceptance. The box is not pre-checked.'
            ),
        ]),
        section('no-account', 'Use without an account', [
            paragraph('Device diagrams:'),
            bullets(
                'are stored locally in the browser',
                'are not backed up automatically by the service',
                'may be lost if the browser or device is cleared',
                'cannot be restored by the service if they were never uploaded'
            ),
        ]),
        section('account', 'Your account', [
            paragraph('You are responsible for:'),
            bullets(
                'accurate information',
                'password security',
                'access to your email',
                'ordinary use of the account'
            ),
            paragraph(
                `If the account is compromised, contact ${legalConfig.supportEmail}.`
            ),
        ]),
        section('ownership', 'Your diagrams belong to you', [
            paragraph('You keep your rights in your diagrams.'),
            paragraph('You grant only a technical license for:'),
            bullets(
                'storage',
                'processing',
                'backup',
                'synchronization',
                'transmission to authorized collaborators'
            ),
            paragraph('This license is:'),
            bullets(
                'non-exclusive',
                'without any transfer of ownership',
                'without separate resale',
                'without AI training, unless a separate agreement says so'
            ),
        ]),
        section(
            'imported-content',
            'You are responsible for content you import',
            [
                bullets(
                    'You need the necessary rights.',
                    'Do not import data you are not allowed to process.',
                    'Avoid passwords.',
                    'Avoid API keys.',
                    'Avoid production secrets.',
                    'Avoid unnecessary personal data.'
                ),
            ]
        ),
        section(
            'professional',
            'Professional data and a processing agreement',
            [
                paragraph(
                    'A professional customer may be the controller for personal data in their diagrams. The service may then be the processor, only on the customer’s instructions.'
                ),
                paragraph(
                    'Where the law requires it, an Article 28 agreement will be offered later. It is not included in this version.'
                ),
            ]
        ),
        section('sharing', 'Sharing and collaboration', [
            paragraph('The owner may:'),
            bullets('invite someone', 'assign a role', 'give or remove access'),
            paragraph('An invitation:'),
            bullets(
                'does not create an account automatically',
                'does not grant access automatically',
                'requires explicit acceptance, following the current product flow'
            ),
        ]),
        section('prohibited', 'What is not allowed', [
            bullets(
                'illegal use',
                'violating someone else’s rights',
                'unauthorized access',
                'bypassing security',
                'attacks or disruption',
                'malware',
                'spam',
                'abusive automation',
                'behavior that threatens security'
            ),
        ]),
        section('report', 'Reporting unlawful content', [
            paragraph(`Write to ${legalConfig.supportEmail}.`),
            paragraph('A useful report includes, where possible:'),
            bullets(
                'the content or diagram',
                'the location or link',
                'the reason',
                'information that helps us handle it'
            ),
            paragraph(
                'Appropriate action may be taken. Where the law requires it, the reasons are given.'
            ),
        ]),
        section('delete-diagram', 'Deleting an Online diagram', [
            bullets(
                'It becomes inaccessible immediately.',
                'It can be restored for 90 days.',
                'It is then deleted from active systems.',
                'This is not a substitute for your own backup.'
            ),
        ]),
        section('delete-account', 'Deleting your account', [
            bullets(
                'Access ends immediately.',
                'Sessions are invalidated.',
                'The account can be restored for 90 days.',
                'The email address stays reserved.',
                'Online diagrams closed with the account are unavailable, and recoverable during that period.'
            ),
            paragraph('If you restore the account:'),
            bullets(
                'it is the same account',
                'diagrams closed with the account come back',
                'diagrams you had already deleted manually stay deleted',
                'old sessions do not come back'
            ),
            paragraph('After 90 days:'),
            bullets(
                'data is purged from active systems',
                'the email address can be used again',
                'a new account is a new identity',
                'old data is not restored automatically'
            ),
        ]),
        section('erasure', 'Right to erasure', [
            paragraph(
                'The 90-day period does not block an applicable erasure. A validated request can trigger an earlier permanent purge. Recovery is then impossible. Data the law still requires may be kept.'
            ),
        ]),
        section('availability', 'Availability and backups', [
            bullets(
                'An online service can fail.',
                'Maintenance happens.',
                'Bugs exist.',
                'Backups are not infallible.',
                'Export important diagrams where you can.'
            ),
        ]),
        section('open-source', 'Open source and the AGPL', [
            bullets(
                'The interface is based on a fork of ChartDB.',
                'ChartDB is under the GNU AGPL v3.',
                [
                    text('The corresponding source code is available at '),
                    externalLink(
                        legalConfig.sourceCodeUrl,
                        legalConfig.sourceCodeUrl
                    ),
                    text('.'),
                ],
                'Open-source rights are independent of these Terms.',
                'Your diagrams do not become AGPL merely because you use the service.'
            ),
        ]),
        section('suspension', 'Suspension of the service or an account', [
            paragraph('Suspension may happen in case of:'),
            bullets(
                'abuse',
                'an attack',
                'fraud',
                'a security risk',
                'unlawful content',
                'a serious breach of the Terms',
                'a legal obligation'
            ),
            paragraph(
                'You are informed where that is appropriate or required by law.'
            ),
        ]),
        section('liability', 'Liability', [
            paragraph(
                'The service is not responsible for consequences directly caused by:'
            ),
            bullets(
                'data you enter',
                'sharing with the wrong recipient',
                'loss of content that existed only on the device',
                'secrets or passwords you deliberately put in a diagram',
                'use that goes against the Terms'
            ),
            paragraph(
                'We do not attempt to exclude liability that the law does not allow us to exclude.'
            ),
        ]),
        section('privacy', 'Personal data', [
            paragraph(
                'Personal data processing is described in the ',
                internalLink('/privacy', 'privacy policy'),
                '.'
            ),
        ]),
        section('paid', 'Paid offer', [
            paragraph(
                'These Terms govern current general use. Before a paid offer, appropriate commercial terms will be added, including where applicable:'
            ),
            bullets(
                'price',
                'billing',
                'renewal',
                'termination',
                'withdrawal rights',
                'consumer mediation'
            ),
        ]),
        section('changes', 'Changes to the Terms', [
            paragraph(
                'The Terms may change. A material change may be announced and, where needed, require a new acceptance.'
            ),
        ]),
        section('law', 'Governing law', [
            paragraph(
                'French law applies. Mandatory consumer protections are not removed.'
            ),
        ]),
        section('contact', 'Contact', [
            bullets(
                `Support: ${legalConfig.supportEmail}`,
                `Privacy: ${legalConfig.privacyEmail}`
            ),
        ]),
    ],
});
