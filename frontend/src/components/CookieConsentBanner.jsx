import React from 'react';
import { Link } from 'react-router-dom';
import { setPrivacyConsent, getPrivacyConsent } from '../constants/privacyPrefs';

const CookieConsentBanner = () => {
    const [consent, setConsent] = React.useState(() => getPrivacyConsent());

    if (consent) return null;

    const handleChoice = (value) => {
        setPrivacyConsent(value);
        setConsent(value);
    };

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="mx-auto max-w-5xl bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 className="text-base md:text-lg font-bold text-gray-900">Cookies sur TerFer</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Nous utilisons des cookies essentiels pour la session et la securite. Vous pouvez accepter
                            ou refuser les cookies non essentiels.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <Link
                            to="/cookies"
                            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                        >
                            Gerer
                        </Link>
                        <button
                            onClick={() => handleChoice('rejected')}
                            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition"
                        >
                            Refuser
                        </button>
                        <button
                            onClick={() => handleChoice('accepted')}
                            className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
                        >
                            Accepter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsentBanner;
