import React from 'react';
import { useTranslation } from 'react-i18next';

const contentByLang = {
    fr: {
        title: 'Politique de confidentialite',
        updated: 'Derniere mise a jour: 22/03/2026',
        intro: 'Cette politique explique comment TerFer collecte, utilise et protege vos donnees lorsque vous utilisez notre marketplace.',
        sections: [
            {
                title: '1. Donnees que nous collectons',
                points: [
                    'Donnees de compte: nom, email, mot de passe chiffre, telephone.',
                    'Donnees boutique vendeur: nom de boutique, description, informations de contact.',
                    'Donnees de commande: produits, adresses, montant, statut et historique.',
                    'Donnees techniques: adresse IP, navigateur, langue et cookies.'
                ]
            },
            {
                title: '2. Pourquoi nous utilisons ces donnees',
                points: [
                    'Creer et gerer votre compte client, vendeur ou admin.',
                    'Traiter les commandes, paiements, livraisons et retours.',
                    'Verifier et approuver les comptes vendeurs.',
                    'Envoyer des emails importants (inscription, reinitialisation, validation vendeur).',
                    'Ameliorer la securite, detecter les fraudes et optimiser le service.'
                ]
            },
            {
                title: '3. Partage des donnees',
                points: [
                    'TerFer ne vend pas vos donnees personnelles.',
                    'Certaines donnees peuvent etre partagees avec des prestataires techniques (email, hebergement, paiement) uniquement pour fournir le service.',
                    'Les vendeurs voient uniquement les informations necessaires pour traiter leurs commandes.'
                ]
            },
            {
                title: '4. Conservation et securite',
                points: [
                    'Nous conservons les donnees aussi longtemps que necessaire pour les obligations commerciales et legales.',
                    'Nous appliquons des mesures techniques et organisationnelles pour proteger vos donnees.',
                    'Aucun systeme n est 100% infaillible, mais nous surveillons et renforcons en continu la securite.'
                ]
            },
            {
                title: '5. Vos droits',
                points: [
                    'Demander l acces, la correction ou la suppression de vos donnees.',
                    'Mettre a jour vos informations depuis votre profil.',
                    'Nous contacter pour toute question relative a la confidentialite.'
                ]
            }
        ]
    },
    en: {
        title: 'Privacy Policy',
        updated: 'Last update: 2026-03-22',
        intro: 'This policy explains how TerFer collects, uses, and protects your data when using our marketplace.',
        sections: [
            {
                title: '1. Data we collect',
                points: [
                    'Account data: name, email, hashed password, phone.',
                    'Seller shop data: shop name, description, and contact details.',
                    'Order data: products, addresses, amount, status, and history.',
                    'Technical data: IP address, browser, language, and cookies.'
                ]
            },
            {
                title: '2. Why we use this data',
                points: [
                    'Create and manage customer, seller, and admin accounts.',
                    'Process orders, payments, deliveries, and returns.',
                    'Review and approve seller registrations.',
                    'Send important emails (signup, reset password, seller approval).',
                    'Improve security, detect fraud, and optimize the service.'
                ]
            },
            {
                title: '3. Data sharing',
                points: [
                    'TerFer does not sell personal data.',
                    'Some data may be shared with technical providers (email, hosting, payment) only to provide the service.',
                    'Sellers only see information needed to fulfill their own orders.'
                ]
            },
            {
                title: '4. Storage and security',
                points: [
                    'We keep data only as long as needed for business and legal obligations.',
                    'We apply technical and organizational security measures.',
                    'No system is 100% failproof, but we continuously monitor and improve security.'
                ]
            },
            {
                title: '5. Your rights',
                points: [
                    'Request access, correction, or deletion of your data.',
                    'Update your profile information directly in your account.',
                    'Contact us for any privacy-related questions.'
                ]
            }
        ]
    }
};

const PrivacyPage = () => {
    const { i18n } = useTranslation();
    const lang = i18n.language === 'en' ? 'en' : 'fr';
    const content = contentByLang[lang];

    return (
        <section className="bg-gray-50 py-12 md:py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">{content.title}</h1>
                    <p className="text-sm text-gray-500 mb-6">{content.updated}</p>
                    <p className="text-gray-700 leading-relaxed mb-8">{content.intro}</p>

                    <div className="space-y-8">
                        {content.sections.map((section) => (
                            <article key={section.title}>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
                                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc pl-6">
                                    {section.points.map((point) => (
                                        <li key={point}>{point}</li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrivacyPage;

