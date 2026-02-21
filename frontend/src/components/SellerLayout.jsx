import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Package, Plus, ShoppingBag,
    TrendingUp, Settings, LogOut, Menu, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SellerLayout = ({ children }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Vérifier l'authentification
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'seller' && user.role !== 'admin') {
            toast.error('Accès réservé aux vendeurs');
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        toast.success('Déconnexion réussie');
        navigate('/login');
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/seller/dashboard' },
        { id: 'products', label: 'Mes Produits', icon: Package, path: '/seller/products' },
        { id: 'add-product', label: 'Ajouter Produit', icon: Plus, path: '/seller/products/new' },
        { id: 'orders', label: 'Commandes', icon: ShoppingBag, path: '/seller/orders' },
        { id: 'analytics', label: 'Statistiques', icon: TrendingUp, path: '/seller/analytics' },
        { id: 'settings', label: 'Paramètres', icon: Settings, path: '/seller/settings' },
    ];

    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
        return null;
    }

    return (
        <div className={`min-h-screen bg-gray-50 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Sidebar Desktop */}
            <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 hidden lg:block">
                <div className="h-full px-3 py-6 overflow-y-auto flex flex-col">
                    {/* Logo/Brand */}
                    <div className="mb-8 px-3">
                        <h1 className="text-2xl font-bold text-gray-900">TerFer</h1>
                        <p className="text-xs text-gray-500 mt-1">Espace Vendeur</p>
                    </div>

                    {/* User Info */}
                    <div className="mb-6 px-3 py-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-primary font-bold text-lg">{user?.name?.charAt(0) || 'S'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all w-full mt-4"
                    >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 w-64 h-screen bg-white border-r border-gray-200 lg:hidden transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full px-3 py-6 overflow-y-auto flex flex-col">
                    {/* Close button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>

                    {/* Logo/Brand */}
                    <div className="mb-8 px-3">
                        <h1 className="text-2xl font-bold text-gray-900">TerFer</h1>
                        <p className="text-xs text-gray-500 mt-1">Espace Vendeur</p>
                    </div>

                    {/* User Info */}
                    <div className="mb-6 px-3 py-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-primary font-bold text-lg">{user?.name?.charAt(0) || 'S'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all w-full mt-4"
                    >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">TerFer Vendeur</h1>
                        <div className="w-10" /> {/* Spacer */}
                    </div>
                </div>

                {/* Content */}
                {children}
            </main>
        </div>
    );
};

export default SellerLayout;
