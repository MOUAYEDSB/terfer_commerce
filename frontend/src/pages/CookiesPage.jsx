import React from 'react';
import { useTranslation } from 'react-i18next';
import { getPrivacyConsent, setPrivacyConsent } from '../constants/privacyPrefs';

const contentByLang = {
    fr: {
        title: 'Politique des cookies',
        updated: 'Derniere mise a jour: 22/03/2026',
        intro: 'Cette page explique comment TerFer utilise les cookies et technologies similaires.',
        sections: [
            {
                title: '1. Qu est-ce qu un cookie',
                points: [
                    'Un cookie est un petit fichier enregistre sur votre appareil.',
                    'Il permet de memoriser des informations utiles lors de votre navigation.'
                ]
            },
            {
                title: '2. Cookies utilises sur TerFer',
                points: [
                    'Cookies essentiels: connexion, securite, session utilisateur.',
                    'Cookies de preferences: langue et certains choix d interface.',
                    'Cookies de performance: mesure de stabilite et d usage pour ameliorer la plateforme.'
                ]
            },
            {
                title: '3. Finalites',
                points: [
                    'Maintenir votre session et proteger votre compte.',
                    'Ameliorer la vitesse, la fiabilite et l experience utilisateur.',
                    'Comprendre les pages les plus consultees afin d optimiser le service (uniquement si vous acceptez les cookies optionnels).'
                ]
            },
            {
                title: '4. Gestion de vos choix',
                points: [
                    'Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies.',
                    'Le blocage de certains cookies peut limiter certaines fonctionnalites du site.',
                    'Vous pouvez aussi effacer les cookies existants a tout moment.'
                ]
            }
        ]
    },
    en: {
        title: 'Cookie Policy',
        updated: 'Last update: 2026-03-22',
        intro: 'This page explains how TerFer uses cookies and similar technologies.',
        sections: [
            {
                title: '1. What is a cookie',
                points: [
                    'A cookie is a small file stored on your device.',
                    'It helps remember useful information during browsing.'
                ]
            },
            {
                title: '2. Cookies used on TerFer',
                points: [
                    'Essential cookies: login, security, and user session.',
                    'Preference cookies: language and interface choices.',
                    'Performance cookies: stability and usage measurement to improve the platform.'
                ]
            },
            {
                title: '3. Purposes',
                points: [
                    'Keep your session active and your account secure.',
                    'Improve speed, reliability, and user experience.',
                    'Understand popular pages to optimize the service (only if optional cookies are accepted).'
                ]
            },
            {
                title: '4. Managing your choices',
                points: [
                    'You can configure your browser to block or delete cookies.',
                    'Blocking some cookies may limit certain site features.',
                    'You may remove existing cookies at any time.'
                ]
            }
        ]
    }
};

const CookiesPage = () => {
    const { i18n } = useTranslation();
    const lang = i18n.language === 'en' ? 'en' : 'fr';
    const content = contentByLang[lang];
    const [consent, setConsent] = React.useState(() => getPrivacyConsent());

    const handleConsent = (value) => {
        setPrivacyConsent(value);
        setConsent(value);
    };

    return (
        <section className="bg-gray-50 py-12 md:py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">{content.title}</h1>
                    <p className="text-sm text-gray-500 mb-6">{content.updated}</p>
                    <p className="text-gray-700 leading-relaxed mb-8">{content.intro}</p>

                    <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                        <p className="text-sm font-semibold text-gray-800">
                            Statut actuel: {consent === 'accepted' ? 'Cookies acceptes' : consent === 'rejected' ? 'Cookies refuses' : 'Aucun choix enregistre'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            Vous pouvez modifier votre choix a tout moment.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => handleConsent('accepted')}
                                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
                            >
                                Accepter
                            </button>
                            <button
                                onClick={() => handleConsent('rejected')}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-300 transition"
                            >
                                Refuser
                            </button>
                        </div>
                    </div>

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

export default CookiesPage;