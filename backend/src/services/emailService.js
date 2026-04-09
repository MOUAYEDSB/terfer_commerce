const nodemailer = require('nodemailer');
let sendgridMail = null;

const getSendgridClient = () => {
    if (!process.env.SENDGRID_API_KEY) return null;
    if (!sendgridMail) {
        // Lazy load to avoid hard dependency when not used
        sendgridMail = require('@sendgrid/mail');
        sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
    return sendgridMail;
};

const getNormalizedEmailPassword = () => {
    const rawEmailPassword = process.env.EMAIL_PASSWORD || '';
    const service = process.env.EMAIL_SERVICE || 'gmail';
    return service === 'gmail'
        ? rawEmailPassword.replace(/\s+/g, '')
        : rawEmailPassword;
};

/**
 * Email service (Nodemailer setup)
 * TODO: Install nodemailer: npm install nodemailer
 * TODO: Configure with actual email service (Gmail, SendGrid, AWS SES, etc.)
 */

// Create email transporter
// For development: Use Ethereal (fake SMTP) or Gmail
// For production: Use SendGrid, AWS SES, or other service
const createTransporter = () => {
    const normalizedEmailPassword = getNormalizedEmailPassword();

    const commonTimeouts = {
        connectionTimeout: process.env.EMAIL_CONNECTION_TIMEOUT_MS ? Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS) : 15000,
        greetingTimeout: process.env.EMAIL_GREETING_TIMEOUT_MS ? Number(process.env.EMAIL_GREETING_TIMEOUT_MS) : 15000,
        socketTimeout: process.env.EMAIL_SOCKET_TIMEOUT_MS ? Number(process.env.EMAIL_SOCKET_TIMEOUT_MS) : 20000
    };

    const commonConnection = process.env.EMAIL_FORCE_IPV4 === 'true' ? { family: 4 } : {};

    // 1) SMTP (recommended / works for SendGrid, Mailgun, SES, etc.)
    if (process.env.EMAIL_HOST) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
            secure: process.env.EMAIL_SECURE === 'true',
            ...commonTimeouts,
            ...commonConnection,
            auth: process.env.EMAIL_USER
                ? { user: process.env.EMAIL_USER, pass: normalizedEmailPassword }
                : undefined
        });
    }

    // 2) SendGrid API key via SMTP
    if (process.env.SENDGRID_API_KEY) {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            ...commonTimeouts,
            ...commonConnection,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    }

    // 3) "service" shortcut (gmail/outlook/etc.)
    const service = process.env.EMAIL_SERVICE || 'gmail';

    // Prefer explicit Gmail SMTP to avoid implicit port/IPv6 issues in some networks.
    if (service === 'gmail') {
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            ...commonTimeouts,
            ...commonConnection,
            auth: process.env.EMAIL_USER
                ? { user: process.env.EMAIL_USER, pass: normalizedEmailPassword }
                : undefined
        });
    }

    return nodemailer.createTransport({
        service,
        ...commonTimeouts,
        ...commonConnection,
        auth: process.env.EMAIL_USER
            ? { user: process.env.EMAIL_USER, pass: normalizedEmailPassword }
            : undefined
    });
};

const assertEmailConfigured = () => {
    // SMTP host without auth can still work (internal relay), so only require auth when USER is provided.
    if (process.env.EMAIL_HOST) {
        if (process.env.EMAIL_USER && !process.env.EMAIL_PASSWORD) {
            throw new Error('Email config invalid: EMAIL_PASSWORD is required when EMAIL_USER is set');
        }
        return;
    }

    if (process.env.SENDGRID_API_KEY) return;

    // service-based transport needs auth for most providers (gmail definitely)
    const normalizedEmailPassword = getNormalizedEmailPassword();
    if (!process.env.EMAIL_USER || !normalizedEmailPassword) {
        throw new Error('Email is not configured: set EMAIL_USER and EMAIL_PASSWORD (or EMAIL_HOST/EMAIL_PORT, or SENDGRID_API_KEY)');
    }
};

/**
 * Send email helper
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message
 * @param {string} options.html - HTML message (optional)
 */
const sendEmail = async (options) => {
    assertEmailConfigured();
    let transporter = null;

    const service = process.env.EMAIL_SERVICE || 'gmail';
    const fallbackFrom = process.env.EMAIL_USER
        ? `TerFer Commerce <${process.env.EMAIL_USER}>`
        : 'TerFer Commerce <noreply@terfer.tn>';

    let from = process.env.EMAIL_FROM || fallbackFrom;
    if (service === 'gmail' && process.env.EMAIL_USER && !from.includes(process.env.EMAIL_USER)) {
        // Gmail often rejects or rewrites "From" when it's not the authenticated mailbox.
        from = fallbackFrom;
    }
    const mailOptions = {
        from,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message
    };

    const sendTimeoutMs = process.env.EMAIL_SEND_TIMEOUT_MS ? Number(process.env.EMAIL_SEND_TIMEOUT_MS) : 20000;

    const withTimeout = async (promise) => {
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error(`Email send timeout after ${sendTimeoutMs}ms`)), sendTimeoutMs);
        });

        try {
            return await Promise.race([promise, timeoutPromise]);
        } finally {
            clearTimeout(timeoutId);
            if (transporter && typeof transporter.close === 'function') {
                try { transporter.close(); } catch (_) { /* ignore */ }
            }
        }
    };

    try {
        // Prefer SendGrid Web API when available to avoid SMTP port blocks.
        const useSendgridApi = process.env.SENDGRID_API_KEY && process.env.SENDGRID_USE_API !== 'false';
        if (useSendgridApi) {
            const sg = getSendgridClient();
            await withTimeout(sg.send(mailOptions));
            return { success: true, provider: 'sendgrid' };
        }

        transporter = createTransporter();
        const info = await withTimeout(transporter.sendMail(mailOptions));
        console.log('Email sent:', info.messageId, 'accepted:', info.accepted, 'rejected:', info.rejected);
        const base = { success: true, messageId: info.messageId };
        if (process.env.NODE_ENV !== 'production') {
            return { ...base, accepted: info.accepted, rejected: info.rejected, response: info.response };
        }
        return base;
    } catch (error) {
        console.error('Error sending email:', error);
        const detailed = process.env.NODE_ENV === 'production'
            ? 'Email could not be sent'
            : `Email could not be sent: ${error.message}`;
        throw new Error(detailed);
    }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `
        Bonjour ${user.name},

        Vous avez demandé la réinitialisation de votre mot de passe.
        
        Cliquez sur le lien suivant pour réinitialiser votre mot de passe:
        ${resetUrl}
        
        Ce lien est valide pendant 1 heure.
        
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        
        Cordialement,
        L'équipe TerFer Commerce
    `;

    const html = `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Bonjour ${user.name},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p><a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser mon mot de passe</a></p>
        <p>Ou copiez ce lien: <code>${resetUrl}</code></p>
        <p>Ce lien est valide pendant 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <br>
        <p>Cordialement,<br>L'équipe TerFer Commerce</p>
    `;

    return await sendEmail({
        email: user.email,
        subject: 'Réinitialisation de votre mot de passe - TerFer Commerce',
        message,
        html
    });
};

/**
 * Send welcome email after registration
 */
const sendWelcomeEmail = async (user) => {
    const message = `
        Bienvenue sur TerFer Commerce, ${user.name}!
        
        Votre compte a été créé avec succès.
        
        Vous pouvez maintenant vous connecter et commencer vos achats.
        
        Cordialement,
        L'équipe TerFer Commerce
    `;

    const html = `
        <h2>Bienvenue sur TerFer Commerce!</h2>
        <p>Bonjour ${user.name},</p>
        <p>Votre compte a été créé avec succès.</p>
        <p>Vous pouvez maintenant vous connecter et commencer vos achats.</p>
        <br>
        <p>Cordialement,<br>L'équipe TerFer Commerce</p>
    `;

    return await sendEmail({
        email: user.email,
        subject: 'Bienvenue sur TerFer Commerce!',
        message,
        html
    });
};

/**
 * Verify transporter connection/auth (useful for debugging).
 */
const verifyEmailTransport = async () => {
    assertEmailConfigured();
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_USE_API !== 'false') {
        // SendGrid Web API doesn't need SMTP verification
        return true;
    }

    const transporter = createTransporter();

    const verifyTimeoutMs = process.env.EMAIL_VERIFY_TIMEOUT_MS ? Number(process.env.EMAIL_VERIFY_TIMEOUT_MS) : 15000;
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Email verify timeout after ${verifyTimeoutMs}ms`)), verifyTimeoutMs);
    });

    try {
        return await Promise.race([transporter.verify(), timeoutPromise]);
    } finally {
        clearTimeout(timeoutId);
        if (typeof transporter.close === 'function') {
            try { transporter.close(); } catch (_) { /* ignore */ }
        }
    }
};

/**
 * Send seller invite email (admin-created seller account)
 */
const sendSellerInviteEmail = async ({ sellerEmail, sellerName, generatedPassword }) => {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

    const message = `
        Bonjour ${sellerName || ''},

        Un compte vendeur vient d'être créé pour vous sur TerFer Commerce.

        Email: ${sellerEmail}
        Mot de passe (généré): ${generatedPassword}

        Connectez-vous ici:
        ${loginUrl}

        Pour des raisons de sécurité, changez votre mot de passe après votre première connexion.

        Cordialement,
        L'équipe TerFer Commerce
    `;

    const html = `
        <h2>Invitation vendeur - TerFer Commerce</h2>
        <p>Bonjour ${sellerName || ''},</p>
        <p>Un compte vendeur vient d'être créé pour vous sur <strong>TerFer Commerce</strong>.</p>
        <p><strong>Email:</strong> ${sellerEmail}</p>
        <p><strong>Mot de passe (généré):</strong> <code>${generatedPassword}</code></p>
        <p><a href="${loginUrl}" target="_blank" rel="noopener noreferrer" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Se connecter</a></p>
        <p>Ou copiez ce lien: <code>${loginUrl}</code></p>
        <p><strong>Important:</strong> changez votre mot de passe après votre première connexion.</p>
        <br>
        <p>Cordialement,<br>L'équipe TerFer Commerce</p>
    `;

    return await sendEmail({
        email: sellerEmail,
        subject: 'Votre compte vendeur - TerFer Commerce',
        message,
        html
    });
};

/**
 * Send seller self-registration acknowledgment email (pending admin approval)
 */
const sendSellerRegistrationPendingEmail = async ({ sellerEmail, sellerName, shopName }) => {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    const shopLabel = shopName ? `Boutique: ${shopName}` : '';

    const message = `
        Bonjour ${sellerName || ''},

        Nous avons bien reçu votre demande d'inscription vendeur sur TerFer Commerce.
        ${shopLabel}

        Votre compte est actuellement en attente de validation par l'administrateur.
        Vous recevrez un nouvel email dès que votre boutique sera approuvée.

        Espace de connexion:
        ${loginUrl}

        Cordialement,
        L'équipe TerFer Commerce
    `;

    const html = `
        <h2>Demande vendeur reçue</h2>
        <p>Bonjour ${sellerName || ''},</p>
        <p>Nous avons bien reçu votre demande d'inscription vendeur sur <strong>TerFer Commerce</strong>.</p>
        ${shopName ? `<p><strong>Boutique:</strong> ${shopName}</p>` : ''}
        <p>Votre compte est actuellement <strong>en attente de validation</strong> par l'administrateur.</p>
        <p>Vous recevrez un nouvel email dès que votre boutique sera approuvée.</p>
        <p><a href="${loginUrl}" target="_blank" rel="noopener noreferrer" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Accéder à la connexion</a></p>
        <p>Ou copiez ce lien: <code>${loginUrl}</code></p>
        <br>
        <p>Cordialement,<br>L'équipe TerFer Commerce</p>
    `;

    return await sendEmail({
        email: sellerEmail,
        subject: 'Demande vendeur reçue - En attente de validation',
        message,
        html
    });
};

/**
 * Send seller approval email when admin validates account
 */
const sendSellerApprovedEmail = async ({ sellerEmail, sellerName }) => {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

    const message = `
        Bonjour ${sellerName || ''},

        Bonne nouvelle: votre compte vendeur TerFer Commerce est maintenant validé.

        Vous pouvez vous connecter et commencer à publier vos produits:
        ${loginUrl}

        Cordialement,
        L'équipe TerFer Commerce
    `;

    const html = `
        <h2>Compte vendeur approuvé</h2>
        <p>Bonjour ${sellerName || ''},</p>
        <p>Bonne nouvelle: votre compte vendeur sur <strong>TerFer Commerce</strong> est maintenant validé.</p>
        <p><a href="${loginUrl}" target="_blank" rel="noopener noreferrer" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Se connecter</a></p>
        <p>Ou copiez ce lien: <code>${loginUrl}</code></p>
        <br>
        <p>Cordialement,<br>L'équipe TerFer Commerce</p>
    `;

    return await sendEmail({
        email: sellerEmail,
        subject: 'Votre compte vendeur est validé - TerFer Commerce',
        message,
        html
    });
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (user, order) => {
    const message = `
        Bonjour ${user.name},
        
        Votre commande #${order.orderNumber} a été confirmée.
        
        Total: ${order.total} DT
        
        Vous recevrez un email lorsque votre commande sera expédiée.
        
        Cordialement,
        L'équipe TerFer Commerce
    `;

    const html = `
        <h2>Confirmation de commande</h2>
        <p>Bonjour ${user.name},</p>
        <p>Votre commande <strong>#${order.orderNumber}</strong> a été confirmée.</p>
        <p>Montant total: <strong>${order.total} DT</strong></p>
        <p>Vous recevrez un email lorsque votre commande sera expédiée.</p>
        <br>
        <p>Cordialement,<br>L'équipe TerFer Commerce</p>
    `;

    return await sendEmail({
        email: user.email,
        subject: `Confirmation de commande #${order.orderNumber}`,
        message,
        html
    });
};

module.exports = {
    sendEmail,
    assertEmailConfigured,
    verifyEmailTransport,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendSellerInviteEmail,
    sendSellerRegistrationPendingEmail,
    sendSellerApprovedEmail,
    sendOrderConfirmationEmail
};
