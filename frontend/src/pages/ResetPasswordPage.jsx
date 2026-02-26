
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const { t, i18n } = useTranslation();
    const { resetToken } = useParams();
    const navigate = useNavigate();
    const isRtl = i18n.language === 'ar';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    // Password strength validation
    const [passwordStrength, setPasswordStrength] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    useEffect(() => {
        // Verify token on mount
        verifyToken();
    }, [resetToken]);

    useEffect(() => {
        // Update password strength
        setPasswordStrength({
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[@$!%*?&]/.test(password),
        });
    }, [password]);

    const verifyToken = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/reset-password/${resetToken}`);
            
            if (response.ok) {
                setIsValidToken(true);
            } else {
                setIsValidToken(false);
                toast.error(t('auth.invalid_token') || 'Lien invalide ou expiré');
            }
        } catch (error) {
            console.error('Token verification error:', error);
            setIsValidToken(false);
            toast.error(t('auth.token_verification_error') || 'Erreur lors de la vérification du lien');
        } finally {
            setIsVerifying(false);
        }
    };

    const isPasswordValid = Object.values(passwordStrength).every(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordValid) {
            toast.error(t('auth.password_requirements_error') || 'Le mot de passe ne respecte pas les critères requis');
            return;
        }

        if (password !== confirmPassword) {
            toast.error(t('auth.passwords_dont_match') || 'Les mots de passe ne correspondent pas');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/reset-password/${resetToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                setResetSuccess(true);
                toast.success(t('auth.password_reset_success') || 'Mot de passe réinitialisé avec succès !');
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                toast.error(data.message || t('auth.password_reset_error') || 'Erreur lors de la réinitialisation');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error(t('auth.password_reset_error') || 'Erreur lors de la réinitialisation');
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('auth.verifying_link') || 'Vérification du lien...'}</p>
                </div>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-8 animate-fade-in text-center">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-red-100 p-3">
                            <XCircle size={48} className="text-red-600" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                            {t('auth.invalid_link') || 'Lien invalide'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-4">
                            {t('auth.invalid_link_message') || 'Ce lien de réinitialisation est invalide ou a expiré. Les liens sont valides pendant 1 heure.'}
                        </p>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-primary hover:text-primary/80 font-medium transition"
                        >
                            {t('auth.request_new_link') || 'Demander un nouveau lien'}
                        </Link>
                        <Link
                            to="/login"
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
                        >
                            {t('auth.back_to_login') || 'Retour à la connexion'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (resetSuccess) {
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
                            {t('auth.password_changed') || 'Mot de passe changé'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-4">
                            {t('auth.password_changed_message') || 'Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...'}
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition font-medium"
                    >
                        {t('auth.login_now') || 'Se connecter maintenant'}
                        <ArrowRight size={18} className={isRtl ? 'rotate-180' : ''} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-8 animate-fade-in">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        {t('auth.reset_password') || 'Nouveau mot de passe'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t('auth.reset_password_subtitle') || 'Choisissez un nouveau mot de passe sécurisé'}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                {t('auth.new_password') || 'Nouveau mot de passe'}
                            </label>
                            <div className="relative">
                                <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-gray-400`}>
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`block w-full rounded-lg border-gray-300 bg-gray-50 py-3 ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'} text-gray-900 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 outline-none border focus:bg-white`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute inset-y-0 ${isRtl ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-400 hover:text-gray-600 transition`}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 animate-slide-down">
                                <p className="text-xs font-semibold text-gray-700 mb-2">
                                    {t('auth.password_requirements') || 'Le mot de passe doit contenir :'}
                                </p>
                                <PasswordRequirement met={passwordStrength.minLength} text={t('auth.min_8_chars') || 'Au moins 8 caractères'} />
                                <PasswordRequirement met={passwordStrength.hasUpperCase} text={t('auth.uppercase') || 'Une lettre majuscule'} />
                                <PasswordRequirement met={passwordStrength.hasLowerCase} text={t('auth.lowercase') || 'Une lettre minuscule'} />
                                <PasswordRequirement met={passwordStrength.hasNumber} text={t('auth.number') || 'Un chiffre'} />
                                <PasswordRequirement met={passwordStrength.hasSpecialChar} text={t('auth.special_char') || 'Un caractère spécial (@$!%*?&)'} />
                            </div>
                        )}

                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                {t('auth.confirm_password') || 'Confirmer le mot de passe'}
                            </label>
                            <div className="relative">
                                <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-gray-400`}>
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`block w-full rounded-lg border-gray-300 bg-gray-50 py-3 ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'} text-gray-900 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 outline-none border focus:bg-white`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={`absolute inset-y-0 ${isRtl ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-400 hover:text-gray-600 transition`}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !isPasswordValid}
                        className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-primary/30 ${(isLoading || !isPasswordValid) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                {t('auth.reset_password_button') || 'Réinitialiser le mot de passe'}
                                <span className={`absolute inset-y-0 ${isRtl ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
                                    <ArrowRight size={18} className={`${isRtl ? 'rotate-180' : ''} opacity-50 group-hover:opacity-100 transition`} />
                                </span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Helper component for password requirements
const PasswordRequirement = ({ met, text }) => (
    <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${met ? 'bg-green-500' : 'bg-gray-300'}`}>
            {met && <CheckCircle size={12} className="text-white" />}
        </div>
        <span className={`text-xs ${met ? 'text-green-700' : 'text-gray-600'}`}>{text}</span>
    </div>
);

export default ResetPasswordPage;
