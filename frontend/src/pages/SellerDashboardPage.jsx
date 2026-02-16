import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import SellerLayout from '../components/SellerLayout';
import { getImgUrl } from '../constants/productConstants';

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

const SellerDashboardPage = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            try {
                // Products of this seller
                const prods = await authFetch(`/api/products?seller=${user._id}&limit=100`);
                setProducts(prods.products || []);

                // Orders for this seller
                const ords = await authFetch('/api/orders/seller/myorders');
                setOrders(ords || []);
            } catch (e) {
                console.error(e);
                toast.error('Erreur lors du chargement du dashboard vendeur');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    if (loading) {
        return (
            <SellerLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </SellerLayout>
        );
    }

    const totalSales = orders.reduce((acc, o) => acc + (o.total || 0), 0);

    return (
        <SellerLayout>
            <div className="p-6 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Vendeur</h1>
                        <p className="text-gray-500">Bienvenue sur votre espace de gestion</p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500 font-semibold">Produits</p>
                                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500 font-semibold">Commandes</p>
                                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500 font-semibold">CA Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalSales.toFixed(0)} TND</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Products Section */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Package size={18} className="text-primary" />
                                    Mes Produits
                                </h2>
                                <Link to="/seller/products" className="text-sm font-semibold text-primary hover:underline">
                                    Voir tout
                                </Link>
                            </div>
                            {products.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-sm text-gray-500 mb-4">Aucun produit pour le moment.</p>
                                    <Link
                                        to="/seller/products/new"
                                        className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:bg-primary/90 transition"
                                    >
                                        <Plus size={18} />
                                        Ajouter un produit
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {products.slice(0, 10).map((p) => (
                                        <div key={p._id} className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition">
                                            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                {p.images?.[0] && (
                                                    <img src={getImgUrl(p.images[0])} alt={p.name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                                                <p className="text-[10px] text-gray-400 line-clamp-1">{p.description}</p>
                                                <p className="text-xs text-gray-500 truncate">{p.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{p.price} TND</p>
                                                <p className="text-xs text-gray-500">Stock: {p.stock}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Orders Section */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <ShoppingBag size={18} className="text-primary" />
                                    Dernières Commandes
                                </h2>
                                <Link to="/seller/orders" className="text-sm font-semibold text-primary hover:underline">
                                    Voir tout
                                </Link>
                            </div>
                            {orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-sm text-gray-500">Aucune commande pour le moment.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {orders.slice(0, 10).map((o) => (
                                        <div key={o._id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{o.orderNumber}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{o.total} TND</p>
                                                <p className={`text-xs capitalize px-2 py-1 rounded-full inline-block ${o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        o.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>{o.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerDashboardPage;
