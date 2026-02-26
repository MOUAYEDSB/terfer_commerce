
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setEmailSent(true);
                toast.success(t('auth.reset_email_sent') || 'Email de réinitialisation envoyé !');
            } else {
                toast.error(data.message || t('auth.reset_email_error') || 'Erreur lors de l\'envoi de l\'email');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error(t('auth.reset_email_error') || 'Erreur lors de l\'envoi de l\'email');
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-8 animate-fade-in text-center">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle size={48} className="text-green-600" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                            {t('auth.check_email') || 'Vérifiez votre email'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-4">
                            {t('auth.reset_email_sent_message') || 'Nous avons envoyé un lien de réinitialisation à'}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">{email}</p>
                        <p className="text-sm text-gray-500 mt-4">
                            {t('auth.check_spam') || 'Vérifiez aussi votre dossier spam si vous ne voyez pas l\'email.'}
                        </p>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <button
                            onClick={() => setEmailSent(false)}
                            className="text-sm text-primary hover:text-primary/80 font-medium transition"
                        >
                            {t('auth.resend_email') || 'Renvoyer l\'email'}
                        </button>
                        <Link
                            to="/login"
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''} />
                            {t('auth.back_to_login') || 'Retour à la connexion'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-8 animate-fade-in">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        {t('auth.forgot_password') || 'Mot de passe oublié'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t('auth.forgot_password_subtitle') || 'Entrez votre email pour recevoir un lien de réinitialisation'}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            {t('auth.email') || 'Email'}
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-gray-400`}>
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`block w-full rounded-lg border-gray-300 bg-gray-50 py-3 ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} text-gray-900 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 outline-none border focus:bg-white`}
                                placeholder="exemple@email.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-primary/30 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                {t('auth.send_reset_link') || 'Envoyer le lien'}
                                <span className={`absolute inset-y-0 ${isRtl ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
                                    <ArrowRight size={18} className={`${isRtl ? 'rotate-180' : ''} opacity-50 group-hover:opacity-100 transition`} />
                                </span>
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition flex items-center justify-center gap-2">
                            <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''} />
                            {t('auth.back_to_login') || 'Retour à la connexion'}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
