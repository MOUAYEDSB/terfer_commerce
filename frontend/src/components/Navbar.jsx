import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Check if user is seller/admin
    const isSeller = user && (user.role === 'seller' || user.role === 'admin');

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            {/* Top Moving Announcement Bar */}
            <div className="bg-[#2563eb] text-white py-3 overflow-hidden border-b border-white/10 shadow-lg relative">
                <div className="flex w-max animate-scroll hover:[animation-play-state:paused] cursor-default whitespace-nowrap">
                    {/* Continuous group for seamless loop */}
                    <div className="flex items-center">
                        {[1, 2].map((group) => (
                            <React.Fragment key={group}>
                                <span className="px-20 text-xs md:text-sm font-black tracking-[0.12em] uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">{t('nav.promo1')}</span>
                                <span className="text-white/30 font-thin">|</span>
                                <span className="px-20 text-xs md:text-sm font-black tracking-[0.12em] uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">{t('nav.promo2')}</span>
                                <span className="text-white/30 font-thin">|</span>
                                <span className="px-20 text-xs md:text-sm font-black tracking-[0.12em] uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">{t('nav.promo3')}</span>
                                <span className="text-white/30 font-thin">|</span>
                                <span className="px-20 text-xs md:text-sm font-black tracking-[0.12em] uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)] text-[#00ffcc]">{t('nav.promo4')}</span>
                                <span className="text-white/30 font-thin">|</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-6">
                    {/* Logo - Black & Blue */}
                    <Link to="/" className="flex items-center gap-1 group whitespace-nowrap">
                        <span className="text-3xl font-black tracking-tighter uppercase italic">
                            <span className="text-gray-900">Ter</span>
                            <span className="text-blue-600">Fer</span>
                        </span>
                    </Link>

                    {/* Search Bar - Sleek & Simple */}
                    <div className="hidden md:flex flex-1 max-w-2xl relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder={t('nav.search_placeholder')}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm"
                        >
                            <Search size={16} />
                        </button>
                    </div>

                    {/* Icons Navigation */}
                    <div className="flex items-center space-x-3 md:space-x-6">
                        {/* Language Selector */}
                        <div className="relative group cursor-pointer hidden sm:flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                            <Globe size={18} />
                            <span className="uppercase text-xs font-bold leading-none">{i18n.language.split('-')[0]}</span>
                            <div className="absolute right-0 top-full mt-2 w-32 bg-white shadow-xl rounded-xl py-2 hidden group-hover:block border border-gray-100 animate-fade-in z-50">
                                <button onClick={() => changeLanguage('fr')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-semibold">Français</button>
                                <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-semibold">English</button>
                                <button onClick={() => changeLanguage('ar')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-semibold">العربية</button>
                            </div>
                        </div>

                        {/* Cart */}
                        <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Profile Dropdown */}
                        <div className="relative group cursor-pointer z-50">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-200">
                                <User size={20} />
                            </div>

                            <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-2xl rounded-2xl py-2 hidden group-hover:block border border-gray-100 animate-slide-up origin-top-right">
                                <div className="px-4 py-3 border-b border-gray-100 mb-1">
                                    <p className="font-black text-gray-900 text-sm">{user ? user.name : t('nav.my_account')}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">{user ? user.email : t('nav.welcome')}</p>
                                </div>
                                {user ? (
                                    <>
                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                                            👤 {t('nav.profile')}
                                        </Link>
                                        <Link to="/profile?tab=orders" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                                            📦 {t('profile.orders')}
                                        </Link>
                                        {isSeller && (
                                            <div className="mt-1 pt-1 border-t border-gray-100">
                                                <Link to="/seller/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 text-sm font-bold text-blue-600 transition-colors">
                                                    🏪 Dashboard Vendeur
                                                </Link>
                                            </div>
                                        )}
                                        <div className="mt-1 pt-1 border-t border-gray-100">
                                            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-sm font-bold text-red-500 transition-colors">
                                                🚪 {t('nav.logout')}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                                            🔑 {t('auth.login_title')}
                                        </Link>
                                        <Link to="/register" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                                            📝 {t('auth.register_title')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>

                {/* Mobile Search - Sleek */}
                <div className="mt-4 md:hidden relative">
                    <input
                        type="text"
                        placeholder={t('nav.search_placeholder')}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-blue-600 text-white rounded-lg shadow-sm flex items-center justify-center"
                    >
                        <Search size={16} />
                    </button>
                </div>
            </div>

            {/* Categories Bar - Minimal Pill Navigation */}
            <div className="bg-gray-50 border-t border-b border-gray-100">
                <div className="container mx-auto px-4 overflow-x-auto">
                    <ul className="flex items-center gap-2 py-3 scrollbar-hide">
                        <li>
                            <Link to="/shop" className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
                                {t('nav.categories.all_shops')}
                            </Link>
                        </li>
                        {[
                            { name: 'Fashion', label: t('nav.categories.clothes') },
                            { name: 'TV & Tech', label: t('nav.categories.electronics') },
                            { name: 'Maison', label: t('nav.categories.home') },
                            { name: 'Beauté', label: t('nav.categories.beauty') },
                            { name: 'Bijoux', label: t('nav.categories.jewelry') },
                            { name: 'Sport', label: t('nav.categories.sport') },
                            { name: 'Auto', label: t('nav.categories.auto') },
                            { name: 'Animaux', label: t('nav.categories.pets') }
                        ].map((cat) => (
                            <li key={cat.name}>
                                <Link to={`/shop?category=${cat.name}`} className={`px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-[11px] font-bold uppercase tracking-tight hover:border-blue-600 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:shadow-md`}>
                                    {cat.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
