const crypto = require('crypto');

const DEFAULT_SPECIAL_CHARS = '@$!%*?&';

const pick = (chars) => chars[crypto.randomInt(0, chars.length)];

const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

/**
 * Generate a strong password that matches the User schema validation:
 * - at least 8 chars
 * - includes lowercase, uppercase, digit, and one of @$!%*?&
 */
const generatePassword = ({ length = 12 } = {}) => {
    const safeLength = Math.max(8, Number(length) || 12);

    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const special = DEFAULT_SPECIAL_CHARS;

    const all = lower + upper + digits + special;

    const passwordChars = [
        pick(lower),
        pick(upper),
        pick(digits),
        pick(special)
    ];

    while (passwordChars.length < safeLength) {
        passwordChars.push(pick(all));
    }

    return shuffle(passwordChars).join('');
};

module.exports = generatePassword;

