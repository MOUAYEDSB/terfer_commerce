import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
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

const SellerProductsPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userRaw);
        if (user.role !== 'seller' && user.role !== 'admin') {
            toast.error('Accès réservé aux vendeurs');
            navigate('/');
            return;
        }

        const load = async () => {
            try {
                const data = await authFetch(`/api/products?seller=${user._id}&limit=200`);
                setProducts(data.products || []);
            } catch (e) {
                console.error(e);
                toast.error('Erreur lors du chargement des produits');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [navigate, i18n.language]);

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce produit ?')) return;
        try {
            await authFetch(`/api/products/${id}`, { method: 'DELETE' });
            setProducts((prev) => prev.filter((p) => p._id !== id));
            toast.success('Produit supprimé');
        } catch (e) {
            console.error(e);
            toast.error('Erreur lors de la suppression');
        }
    };

    if (loading) {
        return (
            <SellerLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <div className="p-6 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Produits</h1>
                            <p className="text-gray-500">Gérez votre catalogue de produits</p>
                        </div>
                        <Link
                            to="/seller/products/new"
                            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-xl font-bold shadow-md hover:bg-primary/90 transition"
                        >
                            <Plus size={18} />
                            Nouveau produit
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        {products.length === 0 ? (
                            <div className="text-center py-20">
                                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit</h3>
                                <p className="text-sm text-gray-500 mb-6">Commencez par ajouter votre premier produit</p>
                                <Link
                                    to="/seller/products/new"
                                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-primary/90 transition"
                                >
                                    <Plus size={18} />
                                    Ajouter un produit
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Produit
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Catégorie
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Prix
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {products.map((p) => (
                                            <tr key={p._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                            {p.images?.[0] && (
                                                                <img src={getImgUrl(p.images[0])} alt={p.name} className="w-full h-full object-cover" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                                                            <p className="text-[10px] text-gray-400 line-clamp-1 mb-1">{p.description}</p>
                                                            <p className="text-xs text-gray-500 truncate">{p.brand || p.shop}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{p.category}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-semibold text-gray-900">{p.price} TND</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock > 10 ? 'bg-green-100 text-green-700' :
                                                        p.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {p.stock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/seller/products/${p._id}`)}
                                                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary transition"
                                                            title="Modifier"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p._id)}
                                                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerProductsPage;
