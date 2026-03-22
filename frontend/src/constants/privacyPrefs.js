export const USER_PRIVACY_PREFS_NAME = 'terfer_cookie_consent';

const getCookieValue = (name) => {
    if (typeof document === 'undefined') return null;
    const chunks = document.cookie ? document.cookie.split('; ') : [];
    const item = chunks.find((part) => part.startsWith(`${name}=`));
    if (!item) return null;
    return decodeURIComponent(item.split('=')[1] || '');
};

export const getPrivacyConsent = () => {
    const value = getCookieValue(USER_PRIVACY_PREFS_NAME);
    if (value === 'accepted' || value === 'rejected') return value;
    return null;
};

export const setPrivacyConsent = (value) => {
    const maxAge = 180 * 24 * 60 * 60;
    document.cookie = `${USER_PRIVACY_PREFS_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('terfer:cookie-consent-changed', { detail: { value } }));
};

export const shouldEnableOptionalCookies = () => getPrivacyConsent() === 'accepted';