import { shouldEnableOptionalCookies } from '../constants/privacyPrefs';

const setAnalyticsState = () => {
    window.terferAnalyticsEnabled = shouldEnableOptionalCookies();
};

export const initAnalyticsGate = () => {
    setAnalyticsState();
    window.addEventListener('terfer:cookie-consent-changed', setAnalyticsState);
};

export const trackEvent = (eventName, payload = {}) => {
    if (!window.terferAnalyticsEnabled) return;
    console.log('[analytics]', eventName, payload);
};
