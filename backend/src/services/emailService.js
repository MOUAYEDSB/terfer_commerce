const nodemailer = require('nodemailer');

/**
 * Email service (Nodemailer setup)
 * TODO: Install nodemailer: npm install nodemailer
 * TODO: Configure with actual email service (Gmail, SendGrid, AWS SES, etc.)
 */

// Create email transporter
// For development: Use Ethereal (fake SMTP) or Gmail
// For production: Use SendGrid, AWS SES, or other service
const createTransporter = () => {
    if (process.env.NODE_ENV === 'production') {
        // Production email service (e.g., SendGrid)
        return nodemailer.createTransporter({
            service: 'SendGrid',
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
            }
        });
    } else {
        // Development: Gmail or Ethereal
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD // App password, not regular password
            }
        });
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
    const transporter = createTransporter();

    const mailOptions = {
        from: `TerFer Commerce <${process.env.EMAIL_FROM || 'noreply@terfer.tn'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
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
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendOrderConfirmationEmail
};
