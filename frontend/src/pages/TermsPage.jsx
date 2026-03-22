import React from 'react';
import { useTranslation } from 'react-i18next';

const contentByLang = {
    fr: {
        title: 'Conditions d utilisation',
        updated: 'Derniere mise a jour: 22/03/2026',
        intro: 'Ces conditions regissent l utilisation de TerFer par les clients, vendeurs et administrateurs.',
        sections: [
            {
                title: '1. Objet du service',
                points: [
                    'TerFer est une marketplace reliant acheteurs et vendeurs.',
                    'Chaque vendeur est responsable de ses produits, prix, descriptions et disponibilites.',
                    'TerFer peut moderer, suspendre ou supprimer des comptes ou annonces non conformes.'
                ]
            },
            {
                title: '2. Comptes utilisateurs',
                points: [
                    'Vous devez fournir des informations exactes lors de l inscription.',
                    'Vous etes responsable de la confidentialite de vos identifiants.',
                    'Les comptes vendeurs sont soumis a validation par l administrateur avant activation.'
                ]
            },
            {
                title: '3. Commandes et paiements',
                points: [
                    'Une commande devient valide apres confirmation du paiement ou de la modalite choisie.',
                    'Les prix affiches sont indiques en TND sauf mention contraire.',
                    'En cas d erreur manifeste (prix, stock), la commande peut etre annulee puis remboursee si necessaire.'
                ]
            },
            {
                title: '4. Livraison, retours et litiges',
                points: [
                    'Les delais de livraison sont indicatifs et dependent des vendeurs et transporteurs.',
                    'Les retours suivent la politique annoncee pour chaque produit ou vendeur.',
                    'En cas de litige, TerFer peut intervenir comme mediateur entre client et vendeur.'
                ]
            },
            {
                title: '5. Responsabilites et interdictions',
                points: [
                    'Il est interdit de publier des contenus illicites, trompeurs ou portant atteinte aux droits de tiers.',
                    'Tout usage frauduleux peut entrainer suspension immediate du compte.',
                    'TerFer ne peut etre tenu responsable des dommages indirects lies a l utilisation de la plateforme.'
                ]
            }
        ]
    },
    en: {
        title: 'Terms and Conditions',
        updated: 'Last update: 2026-03-22',
        intro: 'These terms govern the use of TerFer by customers, sellers, and administrators.',
        sections: [
            {
                title: '1. Service scope',
                points: [
                    'TerFer is a marketplace connecting buyers and sellers.',
                    'Each seller is responsible for products, pricing, descriptions, and stock.',
                    'TerFer may moderate, suspend, or remove non-compliant accounts or listings.'
                ]
            },
            {
                title: '2. User accounts',
                points: [
                    'You must provide accurate information during registration.',
                    'You are responsible for keeping your login credentials secure.',
                    'Seller accounts require admin approval before activation.'
                ]
            },
            {
                title: '3. Orders and payments',
                points: [
                    'An order is valid after payment or selected payment flow confirmation.',
                    'Displayed prices are in TND unless stated otherwise.',
                    'In case of obvious errors (price, stock), an order may be canceled and refunded if needed.'
                ]
            },
            {
                title: '4. Delivery, returns, and disputes',
                points: [
                    'Delivery timelines are estimates and depend on sellers and carriers.',
                    'Returns follow the policy stated for each product or seller.',
                    'In case of dispute, TerFer may act as a mediator between customer and seller.'
                ]
            },
            {
                title: '5. Liability and prohibited use',
                points: [
                    'Illegal, misleading, or rights-infringing content is prohibited.',
                    'Fraudulent behavior may lead to immediate account suspension.',
                    'TerFer is not liable for indirect damages related to platform usage.'
                ]
            }
        ]
    }
};

const TermsPage = () => {
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

export default TermsPage;