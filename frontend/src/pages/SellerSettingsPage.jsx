import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Save, Loader2, Eye, EyeOff, Bell, Lock, Shield, CreditCard, MapPin, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import SellerLayout from '../components/SellerLayout';

const API_URL = 'http://localhost:5000';

const authFetch = async (path, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'API error');
    }
    return res.json();
};

const SellerSettingsPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        shopName: user?.shopName || '',
        shopDescription: user?.shopDescription || '',
        businessType: user?.businessType || 'products',
        address: user?.address || '',
        city: user?.city || '',
        country: user?.country || 'Tunisia',
        postalCode: user?.postalCode || '',
        bankAccount: user?.bankAccount || '',
        bankName: user?.bankName || '',
        accountHolder: user?.accountHolder || '',
    });

    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        orderNotifications: user?.notifications?.orders !== false,
        productNotifications: user?.notifications?.products !== false,
        emailUpdates: user?.notifications?.emails !== false,
    });

    const [selectedTab, setSelectedTab] = useState('profile');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (!user) return;
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            shopName: user.shopName || '',
            shopDescription: user.shopDescription || '',
            businessType: user.businessType || 'products',
            address: user.address || '',
            city: user.city || '',
            country: user.country || 'Tunisia',
            postalCode: user.postalCode || '',
            bankAccount: user.bankAccount || '',
            bankName: user.bankName || '',
            accountHolder: user.accountHolder || '',
        });
    }, [user]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setHasChanges(true);
    };

    const handleSecurityChange = (e) => {
        const { name, value } = e.target;
        setSecurity(prev => ({ ...prev, [name]: value }));
    };

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            const response = await authFetch('/api/users/profile', {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            
            updateUser(response);
            setHasChanges(false);
            toast.success('Profil mis à jour avec succès');
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!security.newPassword || !security.confirmPassword) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        if (security.newPassword !== security.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        if (security.newPassword.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        try {
            setLoading(true);
            await authFetch('/api/users/change-password', {
                method: 'PUT',
                body: JSON.stringify({
                    currentPassword: security.currentPassword,
                    newPassword: security.newPassword
                })
            });

            setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success('Mot de passe modifié avec succès');
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la modification du mot de passe');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        try {
            setLoading(true);
            await authFetch('/api/users/notifications', {
                method: 'PUT',
                body: JSON.stringify(notifications)
            });

            toast.success('Préférences de notifications mises à jour');
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la mise à jour des préférences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SellerLayout>
            <div className="p-6 lg:p-10">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Settings size={32} className="text-primary" />
                            Paramètres
                        </h1>
                        <p className="text-gray-500">Gérez votre profil, sécurité et préférences</p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setSelectedTab('profile')}
                                className={`flex-1 px-6 py-4 font-semibold transition-all ${selectedTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <Store size={18} className="inline mr-2" />
                                Profil & Boutique
                            </button>
                            <button
                                onClick={() => setSelectedTab('bank')}
                                className={`flex-1 px-6 py-4 font-semibold transition-all ${selectedTab === 'bank' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <CreditCard size={18} className="inline mr-2" />
                                Informations Bancaires
                            </button>
                            <button
                                onClick={() => setSelectedTab('security')}
                                className={`flex-1 px-6 py-4 font-semibold transition-all ${selectedTab === 'security' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <Lock size={18} className="inline mr-2" />
                                Sécurité
                            </button>
                            <button
                                onClick={() => setSelectedTab('notifications')}
                                className={`flex-1 px-6 py-4 font-semibold transition-all ${selectedTab === 'notifications' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <Bell size={18} className="inline mr-2" />
                                Notifications
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-8">
                            {/* Profile Tab */}
                            {selectedTab === 'profile' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Votre nom"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="email@example.com"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="+216 12 345 678"
                                            />
                                        </div>

                                        {/* Business Type */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Type de commerce</label>
                                            <select
                                                name="businessType"
                                                value={formData.businessType}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="products">Produits</option>
                                                <option value="services">Services</option>
                                                <option value="both">Produits & Services</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Shop Name & Description */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nom de la boutique</label>
                                        <input
                                            type="text"
                                            name="shopName"
                                            value={formData.shopName}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Nom de votre boutique"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description de la boutique</label>
                                        <textarea
                                            name="shopDescription"
                                            value={formData.shopDescription}
                                            onChange={handleFormChange}
                                            rows="4"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Décrivez votre boutique..."
                                        />
                                    </div>

                                    {/* Address Information */}
                                    <div className="pt-6 border-t border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <MapPin size={18} className="text-primary" />
                                            Adresse
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleFormChange}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="Votre adresse"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleFormChange}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="Votre ville"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Code postal</label>
                                                <input
                                                    type="text"
                                                    name="postalCode"
                                                    value={formData.postalCode}
                                                    onChange={handleFormChange}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="1000"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Pays</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleFormChange}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="Tunisie"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="pt-6 border-t border-gray-200">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={!hasChanges || loading}
                                            className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${hasChanges && !loading ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Bank Tab */}
                            {selectedTab === 'bank' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            <Shield size={16} className="inline mr-2" />
                                            Ces informations bancaires sont cryptées et sécurisées
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom de la banque</label>
                                            <input
                                                type="text"
                                                name="bankName"
                                                value={formData.bankName}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="BNA, BIAT, etc."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Titulaire du compte</label>
                                            <input
                                                type="text"
                                                name="accountHolder"
                                                value={formData.accountHolder}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Nom du titulaire"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro de compte IBAN</label>
                                            <input
                                                type="text"
                                                name="bankAccount"
                                                value={formData.bankAccount}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="TN59 1050 0000 0000 0000 0000"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={loading}
                                            className="px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
                                        >
                                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {loading ? 'Enregistrement...' : 'Enregistrer les informations bancaires'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {selectedTab === 'security' && (
                                <div className="space-y-6">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-sm text-yellow-800">
                                            <Shield size={16} className="inline mr-2" />
                                            Changez votre mot de passe régulièrement pour plus de sécurité
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe actuel</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="currentPassword"
                                                value={security.currentPassword}
                                                onChange={handleSecurityChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                                                placeholder="Entrez votre mot de passe actuel"
                                            />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nouveau mot de passe</label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={security.newPassword}
                                            onChange={handleSecurityChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Entrez le nouveau mot de passe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le mot de passe</label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={security.confirmPassword}
                                            onChange={handleSecurityChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Confirmez le nouveau mot de passe"
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-gray-200">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={loading || !security.currentPassword || !security.newPassword}
                                            className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${security.currentPassword && security.newPassword ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                                            {loading ? 'Modification...' : 'Changer le mot de passe'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {selectedTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={notifications.orderNotifications}
                                                onChange={() => handleNotificationChange('orderNotifications')}
                                                className="w-5 h-5 rounded border-gray-300"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">Notifications de commandes</p>
                                                <p className="text-sm text-gray-500">Recevez une notification pour chaque nouvelle commande</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={notifications.productNotifications}
                                                onChange={() => handleNotificationChange('productNotifications')}
                                                className="w-5 h-5 rounded border-gray-300"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">Notifications de produits</p>
                                                <p className="text-sm text-gray-500">Soyez alerté des mises à jour de stock</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={notifications.emailUpdates}
                                                onChange={() => handleNotificationChange('emailUpdates')}
                                                className="w-5 h-5 rounded border-gray-300"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">Mises à jour par email</p>
                                                <p className="text-sm text-gray-500">Recevez des emails avec nos actualités et conseils</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200">
                                        <button
                                            onClick={handleSaveNotifications}
                                            disabled={loading}
                                            className="px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
                                        >
                                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />}
                                            {loading ? 'Enregistrement...' : 'Enregistrer les préférences'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerSettingsPage;
