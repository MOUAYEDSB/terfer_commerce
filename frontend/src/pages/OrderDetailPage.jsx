import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Phone, Mail, Calendar, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImgUrl } from '../constants/productConstants';

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
        <span className={`px-4 py-2 rounded-full text-sm font-bold ${styles[status] || "bg-gray-100"}`}>
            {labels[status] || status}
        </span>
    );
};

const OrderDetailPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { orderId } = useParams();
    const { user } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!user) {
                    throw new Error('Veuillez vous connecter');
                }

                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/orders/number/${orderId}`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });

                if (!res.ok) {
                    throw new Error('Commande introuvable');
                }

                const data = await res.json();
                setOrder(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId, user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Commande introuvable'}</h2>
                    <Link to="/profile?tab=orders" className="text-primary hover:underline">
                        Retour aux commandes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gray-50 min-h-screen py-10 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <Link to="/profile?tab=orders" className="inline-flex items-center text-gray-500 hover:text-primary mb-6 gap-2">
                    <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} />
                    Mes commandes
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande {order.orderNumber}</h1>
                        <p className="text-gray-500 flex items-center gap-2">
                            <Calendar size={16} />
                            Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <OrderStatusBadge status={order.status} />
                        <Link
                            to={`/order/${order.orderNumber}/invoice`}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                            <Download size={16} />
                            Facture
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tracking */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Truck className="text-primary" />
                                Suivi de commande
                            </h2>
                            <div className="space-y-4">
                                {order.tracking.map((track, idx) => {
                                    const isCompleted = ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) && ['confirmed', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= ['confirmed', 'processing', 'shipped', 'delivered'].indexOf(track.status.toLowerCase().split(' ')[0].toLowerCase());
                                    return (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    {isCompleted ? <CheckCircle size={20} /> : <div className="w-3 h-3 rounded-full bg-gray-300"></div>}
                                                </div>
                                                {idx < order.tracking.length - 1 && (
                                                    <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-200' : 'bg-gray-200'}`}></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {track.status}
                                                </p>
                                                <p className="text-sm text-gray-500">{new Date(track.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                {track.note && <p className="text-sm text-gray-500 mt-1">{track.note}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Items */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Articles commandés</h2>
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            <img src={getImgUrl(item.image) || getImgUrl(item.product?.images?.[0])} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                                            <p className="text-sm text-gray-500 mb-2">{item.shop}</p>
                                            <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(0)} TND</p>
                                            <p className="text-sm text-gray-500">{item.price} TND / unité</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Résumé</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Sous-total</span>
                                    <span className="font-medium text-gray-900">{order.subtotal.toFixed(0)} TND</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Livraison</span>
                                    <span className="font-medium text-gray-900">{order.shippingCost.toFixed(0)} TND</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-primary text-lg">{order.total.toFixed(0)} TND</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-primary" />
                                Informations de livraison
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-gray-600">
                                        <Mail size={16} className="mt-0.5 shrink-0" />
                                        <p>{order.user?.email}</p>
                                    </div>
                                    <div className="flex items-start gap-2 text-gray-600">
                                        <Phone size={16} className="mt-0.5 shrink-0" />
                                        <p>{order.shippingAddress.phone}</p>
                                    </div>
                                    <div className="flex items-start gap-2 text-gray-600">
                                        <MapPin size={16} className="mt-0.5 shrink-0" />
                                        <div>
                                            <p>{order.shippingAddress.address}</p>
                                            <p>{order.shippingAddress.city}</p>
                                            {order.shippingAddress.postalCode && <p>{order.shippingAddress.postalCode}</p>}
                                            <p>{order.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Help */}
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-900 mb-2">Besoin d'aide ?</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Contactez notre service client pour toute question concernant votre commande.
                            </p>
                            <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition">
                                Contacter le support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
