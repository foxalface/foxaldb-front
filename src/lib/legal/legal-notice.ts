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

export const frenchLegalNotice = (): LegalDocument => ({
    id: 'notice',
    language: 'fr',
    title: 'Mentions légales',
    showEnglishPrecedence: false,
    sections: [
        section('publisher', 'Éditeur', [
            paragraph(
                `Le service ${service}, accessible sur ${legalConfig.domain}, est édité par :`
            ),
            bullets(
                `Nom / raison sociale : ${legalConfig.operatorIdentity}`,
                `Statut juridique : ${legalConfig.legalStatus}`,
                `SIREN / SIRET : ${legalConfig.sirenSiret}`,
                `RCS / RNE : ${legalConfig.registration}`,
                `TVA intracommunautaire : ${legalConfig.vatNumber}`,
                `Adresse : ${legalConfig.operatorAddress}`,
                `E-mail : ${legalConfig.supportEmail}`,
                `Téléphone : ${legalConfig.phone}`
            ),
            paragraph(
                `Directeur de la publication : ${legalConfig.publicationDirector}`
            ),
        ]),
        section('hosting', 'Hébergement', [
            paragraph(`${service} est hébergé par :`),
            bullets(
                `Hébergeur : ${legalConfig.hostingProvider}`,
                `Raison sociale : ${legalConfig.hostingLegalName}`,
                `Adresse : ${legalConfig.hostingAddress}`,
                `Téléphone : ${legalConfig.hostingPhone}`
            ),
            paragraph(
                'Ces informations seront complétées lorsque l’infrastructure de production sera choisie.'
            ),
        ]),
        section('open-source', 'Open source et ChartDB', [
            bullets(
                'L’interface du service repose sur un fork de ChartDB.',
                'ChartDB est distribué sous la licence GNU AGPL v3.',
                'Les modifications couvertes par cette licence sont mises à disposition conformément à l’AGPL.',
                [
                    text('Le code source correspondant est disponible ici : '),
                    externalLink(
                        legalConfig.sourceCodeUrl,
                        legalConfig.sourceCodeUrl
                    ),
                    text('.'),
                ],
                'Les licences AGPL et open source ne rendent pas vos diagrammes open source.'
            ),
        ]),
        section('intellectual-property', 'Propriété intellectuelle', [
            bullets(
                'Les éléments propres au produit restent la propriété de leurs titulaires.',
                'Les composants open source restent soumis à leurs licences respectives.',
                'Vous conservez la propriété de vos diagrammes et de vos contenus.'
            ),
        ]),
        section('personal-data', 'Données personnelles', [
            paragraph(
                'Le détail des données utilisées est dans la ',
                internalLink('/privacy', 'politique de confidentialité'),
                '.'
            ),
            paragraph(
                `Contact pour la vie privée : ${legalConfig.privacyEmail}`
            ),
        ]),
        section('report', 'Signaler un contenu ou un usage illicite', [
            paragraph(
                `Pour l’instant, écrivez à ${legalConfig.supportEmail}. Il n’y a pas de formulaire de modération dédié.`
            ),
            paragraph('Indiquez si possible :'),
            bullets(
                'le contenu ou le diagramme concerné',
                'l’emplacement ou le lien',
                'la raison du signalement',
                'les informations utiles pour le comprendre'
            ),
        ]),
        section('contact', 'Contact', [
            paragraph(`Support : ${legalConfig.supportEmail}`),
        ]),
    ],
});

export const englishLegalNotice = (): LegalDocument => ({
    id: 'notice',
    language: 'en',
    title: 'Legal notice',
    showEnglishPrecedence: true,
    sections: [
        section('publisher', 'Publisher', [
            paragraph(
                `The ${service} service, available at ${legalConfig.domain}, is published by:`
            ),
            bullets(
                `Name / legal entity: ${legalConfig.operatorIdentity}`,
                `Legal status: ${legalConfig.legalStatus}`,
                `SIREN / SIRET: ${legalConfig.sirenSiret}`,
                `RCS / RNE: ${legalConfig.registration}`,
                `EU VAT number: ${legalConfig.vatNumber}`,
                `Address: ${legalConfig.operatorAddress}`,
                `Email: ${legalConfig.supportEmail}`,
                `Phone: ${legalConfig.phone}`
            ),
            paragraph(
                `Publication director: ${legalConfig.publicationDirector}`
            ),
        ]),
        section('hosting', 'Hosting', [
            paragraph(`${service} is hosted by:`),
            bullets(
                `Host: ${legalConfig.hostingProvider}`,
                `Legal name: ${legalConfig.hostingLegalName}`,
                `Address: ${legalConfig.hostingAddress}`,
                `Phone: ${legalConfig.hostingPhone}`
            ),
            paragraph(
                'This information will be completed when the production infrastructure is chosen.'
            ),
        ]),
        section('open-source', 'Open source and ChartDB', [
            bullets(
                'The service interface is based on a fork of ChartDB.',
                'ChartDB is distributed under the GNU AGPL v3.',
                'Modifications covered by that license are made available in accordance with the AGPL.',
                [
                    text('The corresponding source code is available at '),
                    externalLink(
                        legalConfig.sourceCodeUrl,
                        legalConfig.sourceCodeUrl
                    ),
                    text('.'),
                ],
                'AGPL and open-source licenses do not make your diagrams open source.'
            ),
        ]),
        section('intellectual-property', 'Intellectual property', [
            bullets(
                'Product-specific assets remain the property of their owners.',
                'Open-source components remain under their respective licenses.',
                'You keep ownership of your diagrams and content.'
            ),
        ]),
        section('personal-data', 'Personal data', [
            paragraph(
                'Details of the data we use are in the ',
                internalLink('/privacy', 'privacy policy'),
                '.'
            ),
            paragraph(`Privacy contact: ${legalConfig.privacyEmail}`),
        ]),
        section('report', 'Report unlawful content or use', [
            paragraph(
                `For now, write to ${legalConfig.supportEmail}. There is no dedicated moderation form.`
            ),
            paragraph('Where you can, include:'),
            bullets(
                'the content or diagram concerned',
                'its location or link',
                'the reason for the report',
                'any information that helps us understand it'
            ),
        ]),
        section('contact', 'Contact', [
            paragraph(`Support: ${legalConfig.supportEmail}`),
        ]),
    ],
});
