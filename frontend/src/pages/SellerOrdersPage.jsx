import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Loader2, ChevronDown, X, Check, AlertCircle, Truck, Clock, Search, Filter } from 'lucide-react';
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

const statusOptions = [
    { value: 'confirmed', label: 'Commande confirmée', color: 'bg-blue-100 text-blue-700' },
    { value: 'processing', label: 'En préparation', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'shipped', label: 'Expédiée', color: 'bg-purple-100 text-purple-700' },
    { value: 'delivered', label: 'Livrée', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Annulée', color: 'bg-red-100 text-red-700' },
];

const getStatusColor = (status) => {
    const option = statusOptions.find(s => s.value === status);
    return option?.color || 'bg-gray-100 text-gray-700';
};

const getStatusLabel = (status) => {
    const option = statusOptions.find(s => s.value === status);
    return option?.label || status;
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'confirmed':
            return <Check size={16} />;
        case 'processing':
            return <Clock size={16} />;
        case 'shipped':
            return <Truck size={16} />;
        case 'delivered':
            return <Check size={16} />;
        case 'cancelled':
            return <X size={16} />;
        default:
            return null;
    }
};

const SellerOrdersPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [note, setNote] = useState('');
    const { user } = useAuth();

    // Filter states
    const [filterSearch, setFilterSearch] = useState('');
    const [filterDay, setFilterDay] = useState('');
    const [filterWeekStart, setFilterWeekStart] = useState('');
    const [filterWeekEnd, setFilterWeekEnd] = useState('');
    useEffect(() => {
        if (!user || user.role !== 'seller') return;

        const load = async () => {
            try {
                const data = await authFetch('/api/orders/seller/myorders');
                setOrders(data || []);
                setFilteredOrders(data || []);
            } catch (e) {
                console.error(e);
                toast.error('Erreur lors du chargement des commandes');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    // Filter orders by all criteria
    useEffect(() => {
        let filtered = orders;

        // Filter by status
        if (selectedStatus) {
            filtered = filtered.filter(o => o.status === selectedStatus);
        }

        // Filter by search (name, phone, order number, ID)
        if (filterSearch.trim()) {
            const search = filterSearch.toLowerCase();
            filtered = filtered.filter(o =>
                o.orderNumber.toLowerCase().includes(search) ||
                o._id.toLowerCase().includes(search) ||
                o.user?.name?.toLowerCase().includes(search) ||
                o.user?.phone?.toLowerCase().includes(search)
            );
        }

        // Filter by specific day
        if (filterDay) {
            const selectedDate = new Date(filterDay);
            selectedDate.setHours(0, 0, 0, 0);

            filtered = filtered.filter(o => {
                const orderDate = new Date(o.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === selectedDate.getTime();
            });
        }

        // Filter by week (this week by default)
        if (filterWeekStart && filterWeekEnd) {
            const startDate = new Date(filterWeekStart);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(filterWeekEnd);
            endDate.setHours(23, 59, 59, 999);

            filtered = filtered.filter(o => {
                const orderDate = new Date(o.createdAt);
                return orderDate >= startDate && orderDate <= endDate;
            });
        }

        setFilteredOrders(filtered);
    }, [selectedStatus, orders, filterSearch, filterDay, filterWeekStart, filterWeekEnd]);

    // Helper function to get week dates
    const getThisWeek = () => {
        const now = new Date();
        const first = now.getDate() - now.getDay();
        const startDate = new Date(now.setDate(first));
        const endDate = new Date(now.setDate(first + 6));
        
        return {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        };
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setUpdatingOrderId(orderId);
            setUpdatingStatus(newStatus);

            const response = await authFetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: newStatus,
                    note: note
                })
            });

            // Update local state
            const updatedOrders = orders.map(o =>
                o._id === orderId ? { ...o, status: newStatus } : o
            );
            setOrders(updatedOrders);
            setFilteredOrders(updatedOrders.filter(o => !selectedStatus || o.status === selectedStatus));

            toast.success(`Commande mise à jour: ${getStatusLabel(newStatus)}`);
            setSelectedOrder(null);
            setNote('');
        } catch (e) {
            console.error(e);
            toast.error('Erreur lors de la mise à jour du statut');
        } finally {
            setUpdatingOrderId(null);
            setUpdatingStatus(null);
        }
    };

    // Get seller items from order
    const getSellerItems = (order) => {
        return order.items.filter(item => item.seller && item.seller.toString() === user._id);
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'confirmed').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
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
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Commandes</h1>
                        <p className="text-gray-500">Gérez toutes vos commandes et mettez à jour leur statut</p>
                    </div>

                    {/* Advanced Filters */}
                    <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                            {/* Search Box */}
                            <div className="lg:col-span-1">
                                <label className="block text-xs font-semibold text-gray-700 mb-2">🔍 Recherche rapide</label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Nom, téléphone, numéro..."
                                        value={filterSearch}
                                        onChange={(e) => setFilterSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            {/* Day Filter */}
                            <div className="lg:col-span-1">
                                <label className="block text-xs font-semibold text-gray-700 mb-2">📅 Par jour</label>
                                <input
                                    type="date"
                                    value={filterDay}
                                    onChange={(e) => setFilterDay(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* This Week Quick Filter */}
                            <div className="lg:col-span-1">
                                <label className="block text-xs font-semibold text-gray-700 mb-2">📆 Semaine</label>
                                <button
                                    onClick={() => {
                                        const { start, end } = getThisWeek();
                                        setFilterWeekStart(start);
                                        setFilterWeekEnd(end);
                                    }}
                                    className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${filterWeekStart && filterWeekEnd ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    {filterWeekStart && filterWeekEnd ? '✓ Cette semaine' : 'Cette semaine'}
                                </button>
                            </div>
                        </div>

                        {/* Quick Filters - Status Buttons */}
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-3">⚡ Filtres rapides</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedStatus(null);
                                        setFilterSearch('');
                                        setFilterDay('');
                                        setFilterWeekStart('');
                                        setFilterWeekEnd('');
                                    }}
                                    className="px-3 py-2 rounded-lg font-semibold text-xs transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
                                >
                                    Tout voir
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('confirmed')}
                                    className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all ${selectedStatus === 'confirmed' ? 'bg-blue-500 text-white shadow-lg' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                >
                                    ✓ Confirmées
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('processing')}
                                    className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all ${selectedStatus === 'processing' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                                >
                                    ⏱️ En préparation
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('shipped')}
                                    className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all ${selectedStatus === 'shipped' ? 'bg-purple-500 text-white shadow-lg' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                                >
                                    🚚 Expédiées
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('delivered')}
                                    className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all ${selectedStatus === 'delivered' ? 'bg-green-500 text-white shadow-lg' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                >
                                    📦 Livrées
                                </button>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(filterSearch || filterDay || filterWeekStart || filterWeekEnd || selectedStatus) && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setFilterSearch('');
                                        setFilterDay('');
                                        setFilterWeekStart('');
                                        setFilterWeekEnd('');
                                        setSelectedStatus(null);
                                    }}
                                    className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                                >
                                    ✕ Réinitialiser les filtres
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div 
                            onClick={() => {
                                setSelectedStatus(null);
                                setFilterSearch('');
                                setFilterDay('');
                                setFilterWeekStart('');
                                setFilterWeekEnd('');
                            }}
                            className={`rounded-xl p-4 cursor-pointer transition-all ${!selectedStatus && !filterSearch && !filterDay && !filterWeekStart ? 'bg-primary text-white shadow-lg' : 'bg-white border border-gray-200'}`}
                        >
                            <p className={`text-xs uppercase font-semibold ${!selectedStatus && !filterSearch && !filterDay && !filterWeekStart ? 'text-white/70' : 'text-gray-500'}`}>Total</p>
                            <p className={`text-2xl font-bold ${!selectedStatus && !filterSearch && !filterDay && !filterWeekStart ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                        </div>

                        <div 
                            onClick={() => {
                                setSelectedStatus('confirmed');
                                setFilterSearch('');
                                setFilterDay('');
                                setFilterWeekStart('');
                                setFilterWeekEnd('');
                            }}
                            className={`rounded-xl p-4 cursor-pointer transition-all ${selectedStatus === 'confirmed' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white border border-gray-200'}`}
                        >
                            <p className={`text-xs uppercase font-semibold ${selectedStatus === 'confirmed' ? 'text-white/70' : 'text-gray-500'}`}>À confirmer</p>
                            <p className={`text-2xl font-bold ${selectedStatus === 'confirmed' ? 'text-white' : 'text-gray-900'}`}>{stats.pending}</p>
                        </div>

                        <div 
                            onClick={() => {
                                setSelectedStatus('processing');
                                setFilterSearch('');
                                setFilterDay('');
                                setFilterWeekStart('');
                                setFilterWeekEnd('');
                            }}
                            className={`rounded-xl p-4 cursor-pointer transition-all ${selectedStatus === 'processing' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white border border-gray-200'}`}
                        >
                            <p className={`text-xs uppercase font-semibold ${selectedStatus === 'processing' ? 'text-white/70' : 'text-gray-500'}`}>En prép</p>
                            <p className={`text-2xl font-bold ${selectedStatus === 'processing' ? 'text-white' : 'text-gray-900'}`}>{stats.processing}</p>
                        </div>

                        <div 
                            onClick={() => {
                                setSelectedStatus('shipped');
                                setFilterSearch('');
                                setFilterDay('');
                                setFilterWeekStart('');
                                setFilterWeekEnd('');
                            }}
                            className={`rounded-xl p-4 cursor-pointer transition-all ${selectedStatus === 'shipped' ? 'bg-purple-500 text-white shadow-lg' : 'bg-white border border-gray-200'}`}
                        >
                            <p className={`text-xs uppercase font-semibold ${selectedStatus === 'shipped' ? 'text-white/70' : 'text-gray-500'}`}>Envoyée</p>
                            <p className={`text-2xl font-bold ${selectedStatus === 'shipped' ? 'text-white' : 'text-gray-900'}`}>{stats.shipped}</p>
                        </div>

                        <div 
                            onClick={() => {
                                setSelectedStatus('delivered');
                                setFilterSearch('');
                                setFilterDay('');
                                setFilterWeekStart('');
                                setFilterWeekEnd('');
                            }}
                            className={`rounded-xl p-4 cursor-pointer transition-all ${selectedStatus === 'delivered' ? 'bg-green-500 text-white shadow-lg' : 'bg-white border border-gray-200'}`}
                        >
                            <p className={`text-xs uppercase font-semibold ${selectedStatus === 'delivered' ? 'text-white/70' : 'text-gray-500'}`}>Livrées</p>
                            <p className={`text-2xl font-bold ${selectedStatus === 'delivered' ? 'text-white' : 'text-gray-900'}`}>{stats.delivered}</p>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Result Count */}
                        {filteredOrders.length > 0 && (
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                <p className="text-sm font-semibold text-gray-700">
                                    {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} trouvée{filteredOrders.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        )}

                        {filteredOrders.length === 0 ? (
                            <div className="p-12 text-center">
                                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 font-semibold">
                                    {selectedStatus ? `Aucune commande ${getStatusLabel(selectedStatus).toLowerCase()}` : 'Aucune commande'}
                                </p>
                                {(filterSearch || filterDay || filterWeekStart || filterWeekEnd) && (
                                    <p className="text-xs text-gray-400 mt-2">Essayez de modifier vos critères de filtrage</p>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Commande</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Articles</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Montant</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => {
                                            const sellerItems = getSellerItems(order);
                                            const sellerItemsTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                                            return (
                                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                                                        <p className="text-xs text-gray-500 mt-1">ID: {order._id.slice(-6)}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-medium text-gray-900">{order.user?.name}</p>
                                                        <p className="text-xs text-gray-500">{order.user?.phone}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-700">{sellerItems.length} article(s)</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-gray-900">{sellerItemsTotal.toFixed(2)} TND</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                            {getStatusIcon(order.status)}
                                                            {getStatusLabel(order.status)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                                                        >
                                                            <ChevronDown size={14} />
                                                            Détails
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Commande {selectedOrder.orderNumber}</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Client</p>
                                    <p className="text-sm font-semibold text-gray-900">{selectedOrder.user?.name}</p>
                                    <p className="text-xs text-gray-600">{selectedOrder.user?.email}</p>
                                    <p className="text-xs text-gray-600">{selectedOrder.user?.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {new Date(selectedOrder.createdAt).toLocaleTimeString('fr-FR')}
                                    </p>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Adresse de livraison</p>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-900">{selectedOrder.shippingAddress?.fullName}</p>
                                    <p className="text-xs text-gray-600">{selectedOrder.shippingAddress?.address}</p>
                                    <p className="text-xs text-gray-600">{selectedOrder.shippingAddress?.city} {selectedOrder.shippingAddress?.postalCode}</p>
                                    <p className="text-xs text-gray-600">{selectedOrder.shippingAddress?.phone}</p>
                                </div>
                            </div>

                            {/* Seller Items */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Articles</p>
                                <div className="space-y-2">
                                    {getSellerItems(selectedOrder).map((item) => (
                                        <div key={item.product} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                                            {item.image && (
                                                <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity} × {item.price} TND</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} TND</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Update */}
                            <div className="border-t border-gray-200 pt-6">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Mettre à jour le statut</p>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setUpdatingStatus(option.value)}
                                                disabled={updatingOrderId === selectedOrder._id && updatingStatus !== option.value}
                                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                                    selectedOrder.status === option.value
                                                        ? 'ring-2 ring-offset-2 ring-primary ' + option.color
                                                        : updatingStatus === option.value
                                                        ? 'ring-2 ring-offset-2 ring-primary bg-gray-100'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        placeholder="Note (optionnelle)..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        rows="2"
                                    />

                                    <button
                                        onClick={() => {
                                            if (updatingStatus && updatingStatus !== selectedOrder.status) {
                                                handleStatusUpdate(selectedOrder._id, updatingStatus);
                                            } else {
                                                toast.error('Sélectionnez un nouveau statut');
                                            }
                                        }}
                                        disabled={updatingOrderId === selectedOrder._id}
                                        className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {updatingOrderId === selectedOrder._id ? 'Mise à jour...' : 'Confirmer la mise à jour'}
                                    </button>
                                </div>
                            </div>

                            {/* Tracking History */}
                            {selectedOrder.tracking && selectedOrder.tracking.length > 0 && (
                                <div className="border-t border-gray-200 pt-6">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Historique</p>
                                    <div className="space-y-2">
                                        {selectedOrder.tracking.map((entry, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-2 h-2 round-full bg-primary mt-2"></div>
                                                    {idx < selectedOrder.tracking.length - 1 && <div className="w-0.5 h-8 bg-gray-300"></div>}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{entry.status}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(entry.date).toLocaleDateString('fr-FR')} - {new Date(entry.date).toLocaleTimeString('fr-FR')}
                                                    </p>
                                                    {entry.note && <p className="text-xs text-gray-600 mt-1">{entry.note}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
};

export default SellerOrdersPage;
