import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Package, ShoppingBag, DollarSign, Users, Eye, ArrowUp, ArrowDown, Calendar, Loader2, BarChart3, PieChart } from 'lucide-react';
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

const SellerAnalyticsPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [timeframe, setTimeframe] = useState('month'); // week, month, year
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalProducts: 0,
        ordersStatus: {},
        topProducts: [],
        salesByDay: [],
        salesByStatus: {},
        monthlyGrowth: 0,
    });

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            try {
                setLoading(true);
                const [productsData, ordersData] = await Promise.all([
                    authFetch(`/api/products?seller=${user._id}&limit=1000`),
                    authFetch('/api/orders/seller/myorders')
                ]);

                const prods = productsData.products || [];
                const ords = ordersData || [];

                setProducts(prods);
                setOrders(ords);

                // Calculate statistics
                calculateStats(prods, ords);
            } catch (e) {
                console.error(e);
                toast.error('Erreur lors du chargement des statistiques');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user]);

    const calculateStats = (prods, ords) => {
        // Filter orders by timeframe
        const now = new Date();
        let startDate = new Date();

        if (timeframe === 'week') {
            // Cette semaine (7 derniers jours)
            startDate.setDate(now.getDate() - 7);
        } else if (timeframe === 'month') {
            // Ce mois (30 derniers jours)
            startDate.setDate(now.getDate() - 30);
        } else if (timeframe === 'year') {
            // Cette année (365 derniers jours)
            startDate.setDate(now.getDate() - 365);
        }

        const filteredOrders = ords.filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= startDate && orderDate <= now;
        });

        // Calculate sales and counts
        let totalSales = 0;
        let ordersCount = 0;
        const salesByStatus = {};
        const ordersStatus = { confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
        const salesByDay = {};

        filteredOrders.forEach(order => {
            const sellerItems = order.items.filter(item => item.seller && item.seller.toString() === user._id);
            if (sellerItems.length === 0) return;

            ordersCount++;
            const orderTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            totalSales += orderTotal;

            // By status
            ordersStatus[order.status] = (ordersStatus[order.status] || 0) + 1;
            salesByStatus[order.status] = (salesByStatus[order.status] || 0) + orderTotal;

            // By day
            const day = new Date(order.createdAt).toLocaleDateString('fr-FR');
            salesByDay[day] = (salesByDay[day] || 0) + orderTotal;
        });

        // Top products
        const productStats = {};
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.seller && item.seller.toString() === user._id) {
                    if (!productStats[item.product]) {
                        productStats[item.product] = {
                            name: item.name,
                            quantity: 0,
                            sales: 0,
                        };
                    }
                    productStats[item.product].quantity += item.quantity;
                    productStats[item.product].sales += item.price * item.quantity;
                }
            });
        });

        const topProducts = Object.values(productStats)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        // Average order value
        const averageOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;

        // Monthly growth
        const thisMonth = filteredOrders.filter(o => {
            const orderDate = new Date(o.createdAt);
            const currentMonth = new Date();
            return orderDate.getMonth() === currentMonth.getMonth() && orderDate.getFullYear() === currentMonth.getFullYear();
        });
        const lastMonth = filteredOrders.filter(o => {
            const orderDate = new Date(o.createdAt);
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
            return orderDate.getMonth() === lastMonthDate.getMonth() && orderDate.getFullYear() === lastMonthDate.getFullYear();
        });

        const thisMonthSales = thisMonth.reduce((sum, o) => {
            return sum + o.items
                .filter(item => item.seller && item.seller.toString() === user._id)
                .reduce((s, item) => s + (item.price * item.quantity), 0);
        }, 0);

        const lastMonthSales = lastMonth.reduce((sum, o) => {
            return sum + o.items
                .filter(item => item.seller && item.seller.toString() === user._id)
                .reduce((s, item) => s + (item.price * item.quantity), 0);
        }, 0);

        const monthlyGrowth = lastMonthSales > 0 ? ((thisMonthSales - lastMonthSales) / lastMonthSales * 100) : 0;

        setStats({
            totalSales,
            totalOrders: ordersCount,
            averageOrderValue,
            totalProducts: prods.length,
            ordersStatus,
            topProducts,
            salesByDay,
            salesByStatus,
            monthlyGrowth,
        });
    };

    const recalculateStats = () => {
        if (products.length > 0 || orders.length > 0) {
            calculateStats(products, orders);
        }
    };

    useEffect(() => {
        recalculateStats();
    }, [timeframe, products, orders]);

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
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <BarChart3 size={32} className="text-primary" />
                                Statistiques
                            </h1>
                            <p className="text-gray-500">Analyse détaillée de votre activité commerciale</p>
                        </div>

                        {/* Timeframe Selector */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTimeframe('week')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${timeframe === 'week' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Cette semaine
                            </button>
                            <button
                                onClick={() => setTimeframe('month')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${timeframe === 'month' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Ce mois
                            </button>
                            <button
                                onClick={() => setTimeframe('year')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${timeframe === 'year' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Cette année
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Sales */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                                    <DollarSign size={24} className="text-green-600" />
                                </div>
                                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${stats.monthlyGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {stats.monthlyGrowth >= 0 ? <ArrowUp size={14} className="inline mr-1" /> : <ArrowDown size={14} className="inline mr-1" />}
                                    {Math.abs(stats.monthlyGrowth).toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Chiffre d'affaires</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalSales.toFixed(0)} TND</p>
                            <p className="text-xs text-gray-500 mt-2">Croissance mensuelle</p>
                        </div>

                        {/* Total Orders */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                                    <ShoppingBag size={24} className="text-blue-600" />
                                </div>
                                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                    Total
                                </span>
                            </div>
                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Commandes</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                            <p className="text-xs text-gray-500 mt-2">Période sélectionnée</p>
                        </div>

                        {/* Average Order Value */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                                    <TrendingUp size={24} className="text-purple-600" />
                                </div>
                                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                                    Moyenne
                                </span>
                            </div>
                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Panier moyen</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.averageOrderValue.toFixed(2)} TND</p>
                            <p className="text-xs text-gray-500 mt-2">Par commande</p>
                        </div>

                        {/* Total Products */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                                    <Package size={24} className="text-amber-600" />
                                </div>
                                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                                    Actifs
                                </span>
                            </div>
                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Produits</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                            <p className="text-xs text-gray-500 mt-2">En ligne</p>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Orders by Status */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <PieChart size={20} className="text-primary" />
                                Commandes par statut
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold text-gray-700">Confirmées</span>
                                        <span className="text-sm font-bold text-gray-900">{stats.ordersStatus.confirmed || 0}</span>
                                    </div>
                                    <div className="w-full bg-blue-100 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.totalOrders > 0 ? (stats.ordersStatus.confirmed || 0) / stats.totalOrders * 100 : 0}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold text-gray-700">En préparation</span>
                                        <span className="text-sm font-bold text-gray-900">{stats.ordersStatus.processing || 0}</span>
                                    </div>
                                    <div className="w-full bg-yellow-100 rounded-full h-2">
                                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${stats.totalOrders > 0 ? (stats.ordersStatus.processing || 0) / stats.totalOrders * 100 : 0}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold text-gray-700">Expédiées</span>
                                        <span className="text-sm font-bold text-gray-900">{stats.ordersStatus.shipped || 0}</span>
                                    </div>
                                    <div className="w-full bg-purple-100 rounded-full h-2">
                                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${stats.totalOrders > 0 ? (stats.ordersStatus.shipped || 0) / stats.totalOrders * 100 : 0}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold text-gray-700">Livrées</span>
                                        <span className="text-sm font-bold text-gray-900">{stats.ordersStatus.delivered || 0}</span>
                                    </div>
                                    <div className="w-full bg-green-100 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.totalOrders > 0 ? (stats.ordersStatus.delivered || 0) / stats.totalOrders * 100 : 0}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold text-gray-700">Annulées</span>
                                        <span className="text-sm font-bold text-gray-900">{stats.ordersStatus.cancelled || 0}</span>
                                    </div>
                                    <div className="w-full bg-red-100 rounded-full h-2">
                                        <div className="bg-red-600 h-2 rounded-full" style={{ width: `${stats.totalOrders > 0 ? (stats.ordersStatus.cancelled || 0) / stats.totalOrders * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sales by Status */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <DollarSign size={20} className="text-primary" />
                                Ventes par statut
                            </h2>
                            <div className="space-y-3">
                                {Object.entries(stats.salesByStatus).map(([status, amount]) => {
                                    const statusLabels = {
                                        confirmed: 'Confirmées',
                                        processing: 'En préparation',
                                        shipped: 'Expédiées',
                                        delivered: 'Livrées',
                                        cancelled: 'Annulées'
                                    };
                                    const statusColors = {
                                        confirmed: { bg: 'bg-blue-100', text: 'text-blue-600' },
                                        processing: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
                                        shipped: { bg: 'bg-purple-100', text: 'text-purple-600' },
                                        delivered: { bg: 'bg-green-100', text: 'text-green-600' },
                                        cancelled: { bg: 'bg-red-100', text: 'text-red-600' }
                                    };

                                    return (
                                        <div key={status}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold text-gray-700">{statusLabels[status]}</span>
                                                <span className={`text-sm font-bold px-2 py-1 rounded ${statusColors[status].bg} ${statusColors[status].text}`}>
                                                    {amount.toFixed(0)} TND
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${statusColors[status].bg}`}
                                                    style={{ width: `${stats.totalSales > 0 ? amount / stats.totalSales * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="pt-3 border-t border-gray-200 mt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900">Total</span>
                                        <span className="text-lg font-bold text-gray-900">{stats.totalSales.toFixed(0)} TND</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <TrendingUp size={20} className="text-primary" />
                                Top produits
                            </h2>
                            {stats.topProducts.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.topProducts.map((product, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.quantity} unité(s)</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{product.sales.toFixed(0)} TND</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">Aucune vente pour cette période</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-primary" />
                            Activité par jour
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Ventes (TND)</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Visualisations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(stats.salesByDay).sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 10).map(([day, sales]) => (
                                        <tr key={day} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-700 font-medium">{day}</td>
                                            <td className="py-3 px-4 text-right font-bold text-gray-900">{sales.toFixed(2)} TND</td>
                                            <td className="py-3 px-4 text-right text-gray-600">-</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {Object.entries(stats.salesByDay).length === 0 && (
                                <p className="text-center text-gray-500 py-8">Aucune activité pour cette période</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerAnalyticsPage;
