
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { register } = useAuth();
    const isRtl = i18n.language === 'ar';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shopName, setShopName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSeller, setIsSeller] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const userData = {
            name,
            email,
            password,
            role: isSeller ? 'seller' : 'customer',
            shopName: isSeller ? shopName : undefined
        };

        const result = await register(userData);

        setIsLoading(false);
        if (result.success) {
            toast.success(result.message || t('auth.register_success') || 'Compte créé avec succès !');
            // Always redirect to login page
            navigate('/login');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-8 animate-fade-in">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t('auth.register_title')}</h2>
                    <p className="text-sm text-gray-500">
                        {t('auth.have_account')} <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition">{t('auth.login_link')}</Link>
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.name')}</label>
                            <div className="relative">
                                <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-gray-400`}>
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`block w-full rounded-lg border-gray-300 bg-gray-50 py-3 ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} text-gray-900 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 outline-none border focus:bg-white`}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.email')}</label>
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

                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.password')}</label>
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

                        {/* Seller Toggle */}
                        <div className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${isSeller ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setIsSeller(!isSeller)}>
                            <div className={`flex items-center justify-center w-6 h-6 rounded-md border mr-3 ${isSeller ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'}`}>
                                {isSeller && <Store size={14} />}
                            </div>
                            <span className="text-sm font-medium text-gray-900 select-none flex-1">{t('auth.seller_check')}</span>
                        </div>

                        {isSeller && (
                            <div className="relative animate-slide-up">
                                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('auth.shop_name') || 'Nom de la boutique'}</label>
                                <div className="relative">
                                    <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-gray-400`}>
                                        <Store size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        className={`block w-full rounded-lg border-gray-300 bg-gray-50 py-3 ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} text-gray-900 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 outline-none border focus:bg-white`}
                                        placeholder="Ma Super Boutique"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                {t('auth.register_button')}
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

export default RegisterPage;
