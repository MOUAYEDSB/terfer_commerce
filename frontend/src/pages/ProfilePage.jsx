
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Package, Heart, User, LogOut, ChevronRight, MapPin, Eye, Loader2, Phone, Mail, Upload, Plus, Pencil, Trash2, CheckCircle, Home, Building2, MapPinned, ImageOff } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getImgUrl } from '../constants/productConstants';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TAB_OPTIONS = ['profile', 'orders', 'wishlist', 'addresses', 'contact'];
const ADDRESS_LABEL_OPTIONS = [
    { value: 'home', label: 'Maison', icon: Home },
    { value: 'work', label: 'Travail', icon: Building2 },
    { value: 'other', label: 'Autre', icon: MapPinned }
];

const normalizeTab = (tab) => {
    if (tab === 'settings') return 'addresses';
    return TAB_OPTIONS.includes(tab) ? tab : 'profile';
};
const isValidPhone = (value) => {
    if (!value) return true;
    const normalized = value.replace(/\s+/g, '');
    return /^(\+216)?\d{8,12}$/.test(normalized);
};
const getAddressLabel = (label) => ADDRESS_LABEL_OPTIONS.find((item) => item.value === label) || ADDRESS_LABEL_OPTIONS[0];

const OrderStatusBadge = ({ status }) => {
    const styles = {
        delivered: "bg-green-100 text-green-700",
        shipped: "bg-blue-100 text-blue-700",
        processing: "bg-blue-100 text-blue-700",
        confirmed: "bg-yellow-100 text-yellow-700",
        pending: "bg-gray-100 text-gray-700",
        cancelled: "bg-red-100 text-red-700"
    };

    const labels = {
        delivered: "Livré",
        shipped: "Expédié",
        processing: "En préparation",
        confirmed: "Confirmé",
        pending: "En attente",
        cancelled: "Annulé"
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || "bg-gray-100"}`}>
            {labels[status] || status}
        </span>
    );
};

const ProfilePage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { tab: tabParam } = useParams();

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', avatar: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [savingAddress, setSavingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        label: 'home',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Tunisia',
        notes: '',
        isDefault: false
    });

    const activeTab = useMemo(() => {
        const tab = searchParams.get('tab') || tabParam || 'profile';
        return normalizeTab(tab);
    }, [searchParams, tabParam]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        setProfileForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            avatar: user.avatar || ''
        });
        setAddresses(user.addresses || []);

        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab, user, navigate]);

    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            const res = await fetch(`${API_URL}/api/orders/myorders`, {
                credentials: 'include'
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la récupération des commandes');
            }

            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error(error.message);
        } finally {
            setLoadingOrders(false);
        }
    };

    const refreshProfile = async () => {
        const res = await fetch(`${API_URL}/api/users/profile`, { credentials: 'include' });
        if (!res.ok) throw new Error('Impossible de charger le profil');
        const data = await res.json();
        updateUser(data);
        setAddresses(data.addresses || []);
    };

    const handleProfileInputChange = (event) => {
        const { name, value } = event.target;
        setProfileForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        if (!profileForm.name?.trim() || !profileForm.email?.trim()) {
            toast.error('Nom et email sont obligatoires');
            return;
        }
        if (!isValidPhone(profileForm.phone || '')) {
            toast.error('Numéro de téléphone invalide');
            return;
        }

        try {
            setSavingProfile(true);
            const res = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profileForm.name,
                    email: profileForm.email,
                    phone: profileForm.phone,
                    avatar: profileForm.avatar
                })
            });

            if (!res.ok) throw new Error('Erreur lors de la mise à jour du profil');

            const data = await res.json();
            updateUser(data);
            toast.success('Coordonnées mises à jour');
        } catch (error) {
            toast.error(error.message || 'Erreur de mise à jour');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploadingAvatar(true);
            const formData = new FormData();
            formData.append('image', file);

            const uploadRes = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            if (!uploadRes.ok) throw new Error('Upload avatar échoué');

            const uploaded = await uploadRes.json();

            const profileRes = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: uploaded.filePath })
            });
            if (!profileRes.ok) throw new Error('Mise à jour avatar échouée');

            const updatedUser = await profileRes.json();
            updateUser(updatedUser);
            setProfileForm((prev) => ({ ...prev, avatar: updatedUser.avatar || uploaded.filePath }));
            toast.success('Photo de profil mise à jour');
        } catch (error) {
            toast.error(error.message || 'Erreur upload avatar');
        } finally {
            setUploadingAvatar(false);
            event.target.value = '';
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            setSavingProfile(true);
            const res = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: '' })
            });
            if (!res.ok) throw new Error('Suppression de la photo impossible');

            const data = await res.json();
            updateUser(data);
            setProfileForm((prev) => ({ ...prev, avatar: data.avatar || '' }));
            toast.success('Photo supprimée');
        } catch (error) {
            toast.error(error.message || 'Erreur suppression photo');
        } finally {
            setSavingProfile(false);
        }
    };

    const resetAddressForm = () => {
        setEditingAddressId(null);
        setAddressForm({
            label: 'home',
            fullName: '',
            phone: '',
            address: '',
            city: '',
            postalCode: '',
            country: 'Tunisia',
            notes: '',
            isDefault: false
        });
    };

    const handleAddressInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setAddressForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSaveAddress = async () => {
        if (!addressForm.fullName || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.postalCode) {
            toast.error('Veuillez remplir tous les champs adresse obligatoires');
            return;
        }
        if (!isValidPhone(addressForm.phone)) {
            toast.error('Numéro de téléphone invalide');
            return;
        }

        try {
            setSavingAddress(true);
            const endpoint = editingAddressId
                ? `${API_URL}/api/users/addresses/${editingAddressId}`
                : `${API_URL}/api/users/addresses`;
            const method = editingAddressId ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressForm)
            });

            if (!res.ok) throw new Error('Erreur lors de la sauvegarde de l adresse');

            const data = await res.json();
            setAddresses(data);
            await refreshProfile();
            resetAddressForm();
            toast.success(editingAddressId ? 'Adresse modifiée' : 'Adresse ajoutée');
        } catch (error) {
            toast.error(error.message || 'Erreur adresse');
        } finally {
            setSavingAddress(false);
        }
    };

    const handleEditAddress = (address) => {
        setEditingAddressId(address._id);
        setAddressForm({
            label: address.label || 'home',
            fullName: address.fullName || '',
            phone: address.phone || '',
            address: address.address || '',
            city: address.city || '',
            postalCode: address.postalCode || '',
            country: address.country || 'Tunisia',
            notes: address.notes || '',
            isDefault: !!address.isDefault
        });
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Supprimer cette adresse ?')) return;
        try {
            setSavingAddress(true);
            const res = await fetch(`${API_URL}/api/users/addresses/${addressId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Erreur suppression adresse');
            await refreshProfile();
            toast.success('Adresse supprimée');
        } catch (error) {
            toast.error(error.message || 'Erreur suppression');
        } finally {
            setSavingAddress(false);
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            setSavingAddress(true);
            const res = await fetch(`${API_URL}/api/users/addresses/${addressId}/default`, {
                method: 'PATCH',
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Erreur mise en adresse principale');
            const data = await res.json();
            setAddresses(data);
            await refreshProfile();
            toast.success('Adresse principale mise à jour');
        } catch (error) {
            toast.error(error.message || 'Erreur mise à jour adresse principale');
        } finally {
            setSavingAddress(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
        toast.success('Déconnexion réussie');
    };
    const defaultAddress = useMemo(() => addresses.find((entry) => entry.isDefault) || null, [addresses]);

    return (
        <div className={`bg-gray-50 min-h-screen py-10 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4">

                {/* Content - No Sidebar */}
                <div className="max-w-4xl mx-auto">

                    {/* Profile Dashboard (Default View) */}
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in">
                            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('profile.title')}</h1>

                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center mb-8">
                                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-gray-100 bg-primary/10 text-primary flex items-center justify-center">
                                    {user?.avatar ? (
                                        <img src={getImgUrl(user.avatar)} alt={user?.name || 'Avatar'} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Profil'}</h2>
                                <p className="text-gray-500">{user?.email}</p>
                                <p className="text-sm text-gray-500 mb-6">{user?.phone || 'Téléphone non renseigné'}</p>
                                <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 mb-6">
                                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm cursor-pointer hover:bg-primary/90 transition">
                                        {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                        {uploadingAvatar ? 'Upload en cours...' : 'Uploader une nouvelle photo'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                                    </label>
                                    <span className="text-xs text-gray-500">PNG, JPG, WEBP</span>
                                    {profileForm.avatar && (
                                        <button
                                            onClick={handleRemoveAvatar}
                                            disabled={savingProfile}
                                            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-red-600 transition"
                                        >
                                            <ImageOff size={14} />
                                            Supprimer photo
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                                    <Link to="/profile?tab=orders" className="block p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md transition bg-gray-50 group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-primary">
                                                <Package size={20} />
                                            </div>
                                            <span className="font-bold text-gray-900">{t('profile.orders')}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Suivez vos commandes en cours et passées.</p>
                                    </Link>

                                    <Link to="/profile?tab=wishlist" className="block p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md transition bg-gray-50 group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-red-500">
                                                <Heart size={20} />
                                            </div>
                                            <span className="font-bold text-gray-900">{t('profile.wishlist')}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">{wishlistItems.length} produits sauvegardés.</p>
                                    </Link>

                                    <Link to="/profile?tab=addresses" className="block p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md transition bg-gray-50 group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-primary">
                                                <MapPin size={20} />
                                            </div>
                                            <span className="font-bold text-gray-900">{t('profile.addresses')}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Gérez vos adresses de livraison.</p>
                                    </Link>

                                    <Link to="/profile?tab=contact" className="block p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md transition bg-gray-50 group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-primary">
                                                <Phone size={20} />
                                            </div>
                                            <span className="font-bold text-gray-900">Mes coordonnées</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Modifiez nom, email et téléphone.</p>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Link to="/profile" className="text-gray-400 hover:text-gray-600"><ChevronRight size={24} className="rotate-180" /></Link>
                                <Package className="text-primary" /> {t('profile.my_orders')}
                            </h2>

                            {loadingOrders ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 size={48} className="animate-spin text-primary" />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">Aucune commande passée</p>
                                    <Link to="/shop" className="inline-block mt-4 text-primary font-bold hover:underline">
                                        Commencer à magasiner
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {orders.map(order => (
                                        <div key={order._id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition border border-transparent hover:border-gray-200">
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-100">
                                                <div>
                                                    <p className="text-sm text-gray-500">{t('profile.order_id')}</p>
                                                    <p className="font-bold text-gray-900">{order.orderNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">{t('profile.order_date')}</p>
                                                    <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">{t('profile.order_total')}</p>
                                                    <p className="font-bold text-primary">{order.total.toFixed(0)} TND</p>
                                                </div>
                                                <OrderStatusBadge status={order.status} />
                                            </div>

                                            <div className="space-y-4">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                            <img src={getImgUrl(item.image) || getImgUrl(item.product?.images?.[0])} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                                                            <p className="text-xs text-gray-500">Qté: {item.quantity} x {item.price.toFixed(0)} TND</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 flex justify-end gap-3">
                                                <Link
                                                    to={`/order/${order.orderNumber}/invoice`}
                                                    className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                                >
                                                    {t('profile.invoice')}
                                                </Link>
                                                <Link
                                                    to={`/order/${order.orderNumber}`}
                                                    className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
                                                >
                                                    <Eye size={16} />
                                                    {t('profile.details')}
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Wishlist Tab */}
                    {activeTab === 'wishlist' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Link to="/profile" className="text-gray-400 hover:text-gray-600"><ChevronRight size={24} className="rotate-180" /></Link>
                                <Heart className="text-red-500" /> {t('profile.my_wishlist')}
                            </h2>

                            {wishlistItems.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">{t('profile.wishlist_empty')}</p>
                                    <Link to="/shop" className="inline-block mt-4 text-primary font-bold hover:underline">
                                        {t('cart.start_shopping')}
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {wishlistItems.map(item => (
                                        <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition border border-gray-100">
                                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                                <img src={getImgUrl(item.image || item.images?.[0])} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                                <button
                                                    onClick={() => removeFromWishlist(item.id)}
                                                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-white transition shadow-sm"
                                                >
                                                    <Heart size={18} fill="currentColor" />
                                                </button>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                                                <p className="text-primary font-bold mt-1">{item.price} TND</p>
                                                <Link to={`/product/${item.id}`} className="block mt-3 w-full text-center py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:border-primary hover:text-primary transition">
                                                    {t('profile.view_product')}
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Addresses Tab */}
                    {activeTab === 'addresses' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Link to="/profile" className="text-gray-400 hover:text-gray-600"><ChevronRight size={24} className="rotate-180" /></Link>
                                <MapPin className="text-primary" /> {t('profile.addresses')}
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <MapPin size={18} className="text-primary" /> Mes adresses
                                            </h3>
                                        </div>

                                        {addresses.length === 0 ? (
                                            <p className="text-sm text-gray-500">Aucune adresse enregistrée pour le moment.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {addresses.map((address) => (
                                                    <div key={address._id} className={`rounded-xl border p-4 ${address.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                                                        <div className="flex flex-wrap justify-between gap-3">
                                                            <div>
                                                                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase rounded-full px-2 py-1 bg-gray-100 text-gray-600 mb-2">
                                                                    {React.createElement(getAddressLabel(address.label).icon, { size: 12 })}
                                                                    {getAddressLabel(address.label).label}
                                                                </span>
                                                                <p className="font-bold text-gray-900">{address.fullName}</p>
                                                                <p className="text-sm text-gray-600">{address.address}, {address.city} {address.postalCode}</p>
                                                                <p className="text-sm text-gray-500">{address.country} • {address.phone}</p>
                                                                {address.notes && <p className="text-xs text-gray-500 mt-1">{address.notes}</p>}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {!address.isDefault && (
                                                                    <button onClick={() => handleSetDefaultAddress(address._id)} disabled={savingAddress} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 transition">
                                                                        Mettre par défaut
                                                                    </button>
                                                                )}
                                                                <button onClick={() => handleEditAddress(address)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                                                                    <Pencil size={15} />
                                                                </button>
                                                                <button onClick={() => handleDeleteAddress(address._id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition">
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {address.isDefault && (
                                                            <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
                                                                <CheckCircle size={14} /> Adresse principale
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {defaultAddress && (
                                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-primary/20">
                                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <CheckCircle size={18} className="text-primary" /> Adresse principale active
                                            </h3>
                                            <p className="font-semibold text-gray-900">{defaultAddress.fullName}</p>
                                            <p className="text-sm text-gray-600">{defaultAddress.address}, {defaultAddress.city} {defaultAddress.postalCode}</p>
                                            <p className="text-sm text-gray-500">{defaultAddress.country} • {defaultAddress.phone}</p>
                                        </div>
                                    )}

                                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Plus size={18} className="text-primary" />
                                            {editingAddressId ? 'Modifier une adresse' : 'Ajouter une adresse'}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <select name="label" value={addressForm.label} onChange={handleAddressInputChange} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                                {ADDRESS_LABEL_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                            <input name="fullName" value={addressForm.fullName} onChange={handleAddressInputChange} placeholder="Nom complet" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                            <input name="phone" value={addressForm.phone} onChange={handleAddressInputChange} placeholder="Téléphone" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                            <input name="address" value={addressForm.address} onChange={handleAddressInputChange} placeholder="Adresse" className="md:col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                            <input name="city" value={addressForm.city} onChange={handleAddressInputChange} placeholder="Ville" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                            <input name="postalCode" value={addressForm.postalCode} onChange={handleAddressInputChange} placeholder="Code postal" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                            <input name="country" value={addressForm.country} onChange={handleAddressInputChange} placeholder="Pays" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                            <input name="notes" value={addressForm.notes} onChange={handleAddressInputChange} placeholder="Instruction de livraison (optionnel)" className="md:col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                                <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressInputChange} />
                                                Définir comme adresse principale
                                            </label>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            <button
                                                onClick={handleSaveAddress}
                                                disabled={savingAddress}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                                            >
                                                {savingAddress ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                {editingAddressId ? 'Mettre à jour' : 'Ajouter l adresse'}
                                            </button>
                                            {editingAddressId && (
                                                <button onClick={resetAddressForm} className="px-4 py-2 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition">
                                                    Annuler
                                                </button>
                                            )}
                                        </div>
                                    </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Tab */}
                    {activeTab === 'contact' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Link to="/profile" className="text-gray-400 hover:text-gray-600"><ChevronRight size={24} className="rotate-180" /></Link>
                                <Phone className="text-primary" /> Mes coordonnées
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <User size={18} className="text-primary" /> Informations personnelles
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold uppercase text-gray-500">Nom complet</label>
                                            <input name="name" value={profileForm.name} onChange={handleProfileInputChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500">Email</label>
                                            <input name="email" type="email" value={profileForm.email} onChange={handleProfileInputChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500">Téléphone</label>
                                            <input name="phone" value={profileForm.phone} onChange={handleProfileInputChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="+216 ..." />
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={savingProfile}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                                        >
                                            {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                            Enregistrer les coordonnées
                                        </button>
                                        <Link
                                            to="/profile?tab=addresses"
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition"
                                        >
                                            <MapPin size={16} />
                                            Gérer mes adresses
                                        </Link>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-fit">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Mail size={18} className="text-primary" /> Aperçu
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Nom</p>
                                            <p className="text-sm font-bold text-gray-900 mt-1">{profileForm.name || 'Non renseigné'}</p>
                                        </div>
                                        <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                                            <p className="text-sm font-bold text-gray-900 mt-1 break-all">{profileForm.email || 'Non renseigné'}</p>
                                        </div>
                                        <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Téléphone</p>
                                            <p className="text-sm font-bold text-gray-900 mt-1">{profileForm.phone || 'Non renseigné'}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
                                    >
                                        <LogOut size={16} />
                                        Déconnexion
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
