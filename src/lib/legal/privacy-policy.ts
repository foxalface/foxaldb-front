import { legalConfig } from './legal-config';
import {
    bullets,
    paragraph,
    section,
    type LegalDocument,
    type LegalSection,
} from './legal-document';

const service = legalConfig.serviceName;

const frenchDataSubsections = (): LegalSection[] => [
    section('account-data', 'Votre compte', [
        bullets(
            'nom ou nom d’affichage',
            'prénom lorsqu’il est renseigné',
            'adresse e-mail',
            'mot de passe sous forme hachée',
            'état de vérification de l’e-mail',
            'préférences',
            'informations de session et d’authentification'
        ),
        paragraph(
            'Le mot de passe n’est jamais enregistré en clair. Seule une empreinte hachée est conservée.'
        ),
    ]),
    section('online-diagrams', 'Vos diagrammes Online', [
        bullets(
            'structure du diagramme',
            'tables, champs et relations',
            'métadonnées',
            'propriétaire et collaborateurs',
            'rôles et permissions',
            'commentaires, conversations, réactions et activités lorsque ces fonctions sont utilisées'
        ),
    ]),
    section('invitations', 'Les invitations', [
        paragraph(
            'Quand un utilisateur A invite un utilisateur B, le service peut traiter :'
        ),
        bullets(
            'l’adresse e-mail invitée',
            'le rôle proposé',
            'l’identité de la personne qui invite',
            'les données techniques de l’invitation'
        ),
        paragraph(
            'L’adresse de la personne invitée peut avoir été fournie par un autre utilisateur, et non directement par la personne invitée.'
        ),
    ]),
    section('technical-data', 'Les données techniques', [
        paragraph(
            'Selon ce que l’application et l’infrastructure enregistrent réellement, les catégories suivantes peuvent être concernées :'
        ),
        bullets(
            'sessions',
            'adresse IP lorsqu’elle est journalisée',
            'informations de navigateur ou d’appareil',
            'journaux techniques',
            'informations d’erreur ou de file d’attente',
            'informations de sécurité ou d’abus'
        ),
        paragraph(
            'L’hébergement de production n’est pas encore choisi. Cette page ne prétend donc pas qu’un élément précis est capturé tant que le code ou l’infrastructure ne le prévoit pas.'
        ),
    ]),
];

const englishDataSubsections = (): LegalSection[] => [
    section('account-data', 'Your account', [
        bullets(
            'name or display name',
            'first name when you provide it',
            'email address',
            'password in hashed form',
            'verification status',
            'preferences',
            'session and authentication information'
        ),
        paragraph(
            'Passwords are never stored in clear text. Only a hashed form is kept.'
        ),
    ]),
    section('online-diagrams', 'Your Online diagrams', [
        bullets(
            'diagram structure',
            'tables, fields, and relationships',
            'metadata',
            'owner and collaborators',
            'roles and permissions',
            'comments, conversations, reactions, and activities where those features are used'
        ),
    ]),
    section('invitations', 'Invitations', [
        paragraph('When user A invites user B, the service may process:'),
        bullets(
            'the invited email address',
            'the proposed role',
            'the inviter’s identity',
            'technical invitation data'
        ),
        paragraph(
            'The invited person’s address may have been provided by another user, not directly by the invited person.'
        ),
    ]),
    section('technical-data', 'Technical data', [
        paragraph(
            'Depending on what the application and infrastructure actually record, these categories may be involved:'
        ),
        bullets(
            'sessions',
            'IP address where it is logged',
            'browser or device information',
            'technical logs',
            'error or queue information',
            'security or abuse information'
        ),
        paragraph(
            'Production hosting is not chosen yet. This page does not claim that a specific item is captured unless the current code or infrastructure does so.'
        ),
    ]),
];

export const frenchPrivacyPolicy = (): LegalDocument => ({
    id: 'privacy',
    language: 'fr',
    title: 'Politique de confidentialité',
    showEnglishPrecedence: false,
    sections: [
        section('intro', 'En bref', [
            paragraph(
                `Cette politique explique simplement quelles données ${service} utilise et pourquoi.`
            ),
        ]),
        section('controller', 'Qui traite vos données ?', [
            bullets(
                `Responsable : ${legalConfig.operatorIdentity}`,
                `Adresse : ${legalConfig.operatorAddress}`,
                `E-mail support : ${legalConfig.supportEmail}`,
                `E-mail vie privée : ${legalConfig.privacyEmail}`
            ),
        ]),
        section(
            'data',
            'Quelles données utilisons-nous ?',
            [],
            frenchDataSubsections()
        ),
        section('device', 'Diagrammes Device', [
            bullets(
                'Ils restent dans votre navigateur.',
                'Ils ne sont pas enregistrés automatiquement sur le serveur.',
                'Ils ne sont pas convertis automatiquement en diagrammes Online.',
                'La suppression du compte ne supprime pas les diagrammes Device.',
                'La restauration du compte ne restaure pas les diagrammes Device.',
                'Une action explicite de votre part peut envoyer un contenu au serveur lorsque la fonction l’exige.'
            ),
        ]),
        section('purposes', 'Pourquoi utilisons-nous ces données ?', [
            paragraph('Fournir le service'),
            bullets(
                'Créer votre compte, enregistrer les diagrammes Online, partager, collaborer et fournir les fonctions demandées.',
                'Base juridique : exécution du service demandé.'
            ),
            paragraph('Sécuriser le service'),
            bullets(
                'Protéger les comptes, limiter les abus et garder le service fiable.',
                'Base juridique : intérêt légitime.'
            ),
            paragraph('Envoyer les e-mails nécessaires'),
            bullets(
                'Vérification, invitation, restauration de compte, réinitialisation de mot de passe et autres messages liés au service.',
                'Base juridique : exécution du service et sécurité.'
            ),
            paragraph('Respecter nos obligations légales'),
            bullets(
                'Répondre aux obligations qui s’imposent au service.',
                'Base juridique : obligation légale.'
            ),
        ]),
        section(
            'professional',
            'Données contenues dans les diagrammes de clients professionnels',
            [
                bullets(
                    'Un client professionnel peut être responsable de traitement pour les données personnelles qu’il place dans ses diagrammes.',
                    'Le service peut agir comme sous-traitant lorsqu’il traite ces données uniquement sur instruction du client.',
                    'Lorsque la loi l’exige, cette relation doit être encadrée par un contrat de sous-traitance (article 28 du RGPD).',
                    'Le service reste responsable de traitement pour son propre compte, sa sécurité et, plus tard, sa facturation.'
                ),
                paragraph(
                    'Aucun contrat de sous-traitance n’est fourni dans cette version.'
                ),
            ]
        ),
        section('ai', 'Utilisons-nous vos diagrammes pour entraîner une IA ?', [
            paragraph('Non.'),
            paragraph(
                'Nous n’utilisons pas vos diagrammes privés ni vos contenus :'
            ),
            bullets(
                'pour entraîner nos propres modèles d’IA',
                'pour entraîner des modèles de tiers',
                'pour de la publicité ciblée'
            ),
        ]),
        section('sharing', 'Avec qui partageons-nous les données ?', [
            paragraph('Les destinataires possibles sont :'),
            bullets(
                'l’exploitant du service',
                'les collaborateurs que vous autorisez explicitement',
                `les hébergeurs de production (${legalConfig.hostingProvider})`,
                `le fournisseur d’e-mails transactionnels (${legalConfig.transactionalEmailProvider})`,
                'd’autres sous-traitants techniques nécessaires'
            ),
            paragraph(
                'L’hébergeur et le fournisseur d’e-mails de production ne sont pas encore choisis. Mailpit sert uniquement au développement.'
            ),
        ]),
        section('transfers', 'Transferts hors Union européenne', [
            paragraph(
                'L’infrastructure de production n’est pas finalisée. Cette section reste donc incomplète.'
            ),
            paragraph(
                'S’il y a un transfert hors de l’Union européenne, il utilisera un mécanisme autorisé par le RGPD. Aucun mécanisme précis n’est indiqué tant que l’hébergement n’est pas choisi.'
            ),
        ]),
        section('retention', 'Combien de temps gardons-nous les données ?', [
            paragraph('Compte actif'),
            bullets(
                'Les données du compte sont conservées tant que le compte existe et que ces données sont nécessaires au service.'
            ),
            paragraph('Compte supprimé normalement'),
            bullets(
                'L’accès s’arrête immédiatement.',
                'Le compte peut être restauré pendant 90 jours.',
                'L’adresse e-mail reste réservée pendant cette période.',
                'Les diagrammes Online fermés avec le compte peuvent être restaurés.',
                'Après 90 jours, ils sont effacés des systèmes actifs.'
            ),
            paragraph('Diagramme Online supprimé'),
            bullets(
                'Il devient inaccessible immédiatement.',
                'Il peut être restauré pendant 90 jours.',
                'Il est ensuite effacé des systèmes actifs.',
                'Un diagramme supprimé manuellement n’est pas recréé si le compte est restauré plus tard.'
            ),
            paragraph('Demande d’effacement RGPD'),
            bullets(
                'Le délai de récupération de 90 jours ne bloque pas le droit à l’effacement.',
                'Une demande validée et applicable peut déclencher un effacement définitif plus tôt.',
                'La restauration devient alors impossible.',
                'Des données exigées par la loi peuvent encore devoir être conservées.'
            ),
            paragraph('Liens de restauration'),
            bullets('Un lien de restauration reste utilisable 60 minutes.'),
            paragraph('Invitations'),
            bullets(
                'Une invitation est valable 7 jours.',
                `Après expiration ou révocation, la conservation restante est : ${legalConfig.invitationRetention}.`
            ),
            paragraph('Conversations et activités'),
            bullets(
                'Les conversations actives restent liées au diagramme.',
                'Les conversations archivées sont actuellement effacées après 30 jours.',
                `La conservation des activités est : ${legalConfig.activityRetention}.`
            ),
            paragraph('Journaux, sauvegardes et données techniques'),
            bullets(
                `Journaux : ${legalConfig.logRetention}`,
                `Tâches en échec : ${legalConfig.failedJobRetention}`,
                `Sauvegardes : ${legalConfig.backupRetention}`,
                `Fournisseur d’e-mail : ${legalConfig.emailProviderRetention}`
            ),
        ]),
        section('backups', 'Que se passe-t-il dans les sauvegardes ?', [
            bullets(
                'L’effacement définitif dans l’application retire les données des systèmes actifs.',
                'Des copies temporaires de sauvegarde, d’instantané ou de journaux binaires peuvent rester, selon l’infrastructure de production.',
                'Ces copies ne sont pas un moyen normal de restaurer un compte.',
                'Après un sinistre, les effacements définitifs déjà réalisés doivent être réconciliés et réappliqués.',
                'La durée réelle sera précisée une fois l’hébergement choisi.'
            ),
        ]),
        section('cookies', 'Cookies et stockage local', [
            paragraph('Le service utilise aujourd’hui :'),
            bullets(
                'des cookies ou stockages nécessaires à l’authentification',
                'des mesures de sécurité',
                'la session',
                'vos préférences',
                'le stockage local des diagrammes Device'
            ),
            paragraph('Actuellement :'),
            bullets(
                'pas de régie publicitaire',
                'pas de traceur publicitaire',
                'pas de mesure d’audience tierce'
            ),
            paragraph(
                'Si cela change, un mécanisme de consentement sera mis en place lorsque la loi l’exige.'
            ),
        ]),
        section('security', 'Comment protégeons-nous vos données ?', [
            bullets(
                'hachage des mots de passe',
                'jetons temporaires protégés',
                'contrôles d’autorisation',
                'expiration des liens sensibles',
                'invalidation des sessions',
                'séparation entre diagrammes Device et Online'
            ),
            paragraph(
                'Ces mesures réduisent les risques. Elles ne constituent pas une sécurité absolue.'
            ),
        ]),
        section('rights', 'Quels sont vos droits ?', [
            paragraph('Vous pouvez demander :'),
            bullets(
                'l’accès',
                'la rectification',
                'l’effacement',
                'la portabilité lorsque elle s’applique',
                'la limitation',
                'l’opposition',
                'le retrait lorsque le consentement est la base du traitement'
            ),
            paragraph(
                `Écrivez à ${legalConfig.privacyEmail}. Une vérification raisonnable de votre identité peut être demandée.`
            ),
            paragraph(
                'Vous pouvez aussi introduire une réclamation auprès de la CNIL.'
            ),
        ]),
        section('automated', 'Décisions automatisées', [
            paragraph(
                'Aucune décision produisant des effets juridiques, ou des effets similaires importants, n’est prise de façon uniquement automatique.'
            ),
        ]),
        section('changes', 'Modifications', [
            paragraph('Cette politique peut changer, par exemple en cas de :'),
            bullets(
                'évolution du service',
                'nouvelles fonctions',
                'changement de prestataire',
                'changement des durées de conservation',
                'évolution de la loi'
            ),
            paragraph(
                'La date en haut de la page indique la dernière mise à jour.'
            ),
        ]),
    ],
});

export const englishPrivacyPolicy = (): LegalDocument => ({
    id: 'privacy',
    language: 'en',
    title: 'Privacy policy',
    showEnglishPrecedence: true,
    sections: [
        section('intro', 'In short', [
            paragraph(
                `This policy explains, in plain language, which data ${service} uses and why.`
            ),
        ]),
        section('controller', 'Who processes your data?', [
            bullets(
                `Controller: ${legalConfig.operatorIdentity}`,
                `Address: ${legalConfig.operatorAddress}`,
                `Support email: ${legalConfig.supportEmail}`,
                `Privacy email: ${legalConfig.privacyEmail}`
            ),
        ]),
        section('data', 'Which data do we use?', [], englishDataSubsections()),
        section('device', 'Device diagrams', [
            bullets(
                'They stay in your browser.',
                'They are not stored on the server automatically.',
                'They are not converted to Online diagrams automatically.',
                'Deleting the account does not delete Device diagrams.',
                'Restoring the account does not restore Device diagrams.',
                'An explicit action by you may send content to the server when a feature requires it.'
            ),
        ]),
        section('purposes', 'Why do we use this data?', [
            paragraph('Provide the service'),
            bullets(
                'Create your account, save Online diagrams, share, collaborate, and provide the features you ask for.',
                'Legal basis: performance of the service you request.'
            ),
            paragraph('Keep the service secure'),
            bullets(
                'Protect accounts, limit abuse, and keep the service reliable.',
                'Legal basis: legitimate interest.'
            ),
            paragraph('Send the emails the service needs'),
            bullets(
                'Verification, invitation, account restoration, password reset, and other service messages.',
                'Legal basis: performance of the service and security.'
            ),
            paragraph('Meet legal duties'),
            bullets(
                'Respond to obligations that apply to the service.',
                'Legal basis: legal obligation.'
            ),
        ]),
        section(
            'professional',
            'Data inside professional customers’ diagrams',
            [
                bullets(
                    'A professional customer may be the controller for personal data they put in their diagrams.',
                    'The service may act as processor when it processes that data only on the customer’s instructions.',
                    'Where the law requires it, that relationship must be covered by an Article 28 data processing agreement.',
                    'The service remains controller for its own account, security, and future billing purposes.'
                ),
                paragraph(
                    'This version does not include a data processing agreement.'
                ),
            ]
        ),
        section('ai', 'Do we use your diagrams to train AI?', [
            paragraph('No.'),
            paragraph('We do not use your private diagrams or content:'),
            bullets(
                'to train our own AI models',
                'to train third-party models',
                'for targeted advertising'
            ),
        ]),
        section('sharing', 'Who do we share data with?', [
            paragraph('Possible recipients:'),
            bullets(
                'the service operator',
                'collaborators you explicitly authorize',
                `production hosting providers (${legalConfig.hostingProvider})`,
                `the transactional email provider (${legalConfig.transactionalEmailProvider})`,
                'other necessary technical processors'
            ),
            paragraph(
                'The production host and email provider are not chosen yet. Mailpit is for development only.'
            ),
        ]),
        section('transfers', 'Transfers outside the European Union', [
            paragraph(
                'Production infrastructure is not final. This section is therefore unfinished.'
            ),
            paragraph(
                'If a transfer outside the European Union applies, it will use a mechanism authorized by the GDPR. No specific mechanism is stated until hosting is chosen.'
            ),
        ]),
        section('retention', 'How long do we keep data?', [
            paragraph('Active account'),
            bullets(
                'Account data is kept while the account exists and the data is needed for the service.'
            ),
            paragraph('Account deleted in the normal way'),
            bullets(
                'Access ends immediately.',
                'The account can be restored for 90 days.',
                'The email address stays reserved during that period.',
                'Online diagrams closed with the account can be restored.',
                'After 90 days they are purged from active systems.'
            ),
            paragraph('Deleted Online diagram'),
            bullets(
                'It becomes inaccessible immediately.',
                'It can be restored for 90 days.',
                'It is then purged from active systems.',
                'A diagram you deleted manually is not brought back if the account is restored later.'
            ),
            paragraph('GDPR erasure request'),
            bullets(
                'The 90-day recovery period does not block the right to erasure.',
                'A validated and applicable request can trigger an earlier permanent purge.',
                'Recovery is then impossible.',
                'Data that the law still requires may have to be kept.'
            ),
            paragraph('Restoration links'),
            bullets('A restoration link works for 60 minutes.'),
            paragraph('Invitations'),
            bullets(
                'An invitation is valid for 7 days.',
                `Retention after expiry or revocation: ${legalConfig.invitationRetention}.`
            ),
            paragraph('Conversations and activity'),
            bullets(
                'Active conversations stay tied to the diagram.',
                'Archived conversations are currently purged after 30 days.',
                `Activity retention: ${legalConfig.activityRetention}.`
            ),
            paragraph('Logs, backups, and technical data'),
            bullets(
                `Logs: ${legalConfig.logRetention}`,
                `Failed jobs: ${legalConfig.failedJobRetention}`,
                `Backups: ${legalConfig.backupRetention}`,
                `Email provider: ${legalConfig.emailProviderRetention}`
            ),
        ]),
        section('backups', 'What happens in backups?', [
            bullets(
                'A permanent purge in the application removes data from active systems.',
                'Temporary backup, snapshot, or binary-log copies may remain, depending on production infrastructure.',
                'Those copies are not a normal way to restore an account.',
                'After disaster recovery, permanent deletions that already happened must be reconciled and reapplied.',
                'The real retention period will be added once hosting is chosen.'
            ),
        ]),
        section('cookies', 'Cookies and local storage', [
            paragraph('The service currently uses:'),
            bullets(
                'storage needed for authentication',
                'security measures',
                'the session',
                'your preferences',
                'local storage for Device diagrams'
            ),
            paragraph('Currently there is:'),
            bullets(
                'no ad network',
                'no advertising tracker',
                'no third-party audience analytics'
            ),
            paragraph(
                'If that changes, a consent mechanism will be added where the law requires it.'
            ),
        ]),
        section('security', 'How do we protect your data?', [
            bullets(
                'password hashing',
                'secure temporary tokens',
                'authorization checks',
                'expiry of sensitive links',
                'session invalidation',
                'separation between Device and Online diagrams'
            ),
            paragraph(
                'These measures reduce risk. They are not a promise of absolute security.'
            ),
        ]),
        section('rights', 'What are your rights?', [
            paragraph('You can ask for:'),
            bullets(
                'access',
                'rectification',
                'erasure',
                'portability when it applies',
                'restriction',
                'objection',
                'withdrawal where consent is the legal basis'
            ),
            paragraph(
                `Write to ${legalConfig.privacyEmail}. We may ask for a reasonable identity check.`
            ),
            paragraph('You can also lodge a complaint with the CNIL.'),
        ]),
        section('automated', 'Automated decisions', [
            paragraph(
                'No decision that produces legal effects, or similarly significant effects, is made solely by automated means.'
            ),
        ]),
        section('changes', 'Changes', [
            paragraph('This policy can change, for example because of:'),
            bullets(
                'a change to the service',
                'new features',
                'a change of provider',
                'a change in retention periods',
                'a change in the law'
            ),
            paragraph('The date at the top of the page is the last update.'),
        ]),
    ],
});
