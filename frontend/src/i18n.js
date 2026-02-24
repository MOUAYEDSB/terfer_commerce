
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'fr',
        supportedLngs: ['fr', 'ar', 'en'],
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

// Handle RTL for Arabic
i18n.on('languageChanged', (lng) => {
    const htmlElement = document.documentElement;
    if (lng === 'ar') {
        htmlElement.dir = 'rtl';
        htmlElement.lang = 'ar';
        document.body.dir = 'rtl';
        document.body.style.direction = 'rtl';
    } else {
        htmlElement.dir = 'ltr';
        htmlElement.lang = lng;
        document.body.dir = 'ltr';
        document.body.style.direction = 'ltr';
    }
});

// Set initial direction
window.addEventListener('load', () => {
    const currentLng = i18n.language;
    const htmlElement = document.documentElement;
    if (currentLng === 'ar') {
        htmlElement.dir = 'rtl';
        htmlElement.lang = 'ar';
        document.body.dir = 'rtl';
        document.body.style.direction = 'rtl';
    }
});

export default i18n;
