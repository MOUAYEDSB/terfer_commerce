
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Package, Heart, User, LogOut, ChevronRight, MapPin, CreditCard, ShoppingBag, Eye, Loader2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getImgUrl } from '../constants/productConstants';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        if (searchParams.get('tab')) {
            setActiveTab(searchParams.get('tab'));
        }
    }, [searchParams]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab, user]);

    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/orders/myorders`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
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

    const handleLogout = () => {
        logout();
        navigate('/');
        toast.success('Déconnexion réussie');
    };

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
                                <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User size={48} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Profil'}</h2>
                                <p className="text-gray-500 mb-6">{user?.email}</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
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

                                    <Link to="/profile?tab=settings" className="block p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md transition bg-gray-50 group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-primary">
                                                <MapPin size={20} />
                                            </div>
                                            <span className="font-bold text-gray-900">{t('profile.addresses')}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Gérez vos adresses de livraison.</p>
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

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Link to="/profile" className="text-gray-400 hover:text-gray-600"><ChevronRight size={24} className="rotate-180" /></Link>
                                <MapPin className="text-primary" /> {t('profile.addresses')}
                            </h2>
                            <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
                                <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900">Mes Adresses</h3>
                                <p className="text-gray-500 mt-2">Gérez vos adresses de livraison ici. (Bientôt disponible)</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
