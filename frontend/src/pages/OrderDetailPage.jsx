import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Phone, Mail, Calendar, Download } from 'lucide-react';
import { getImgUrl } from '../constants/productConstants';

// Mock order data - à remplacer par un appel API
const getOrderById = (id) => {
    const orders = {
        "ORD-2023-1001": {
            id: "ORD-2023-1001",
            date: "2023-10-15",
            status: "delivered",
            total: 125,
            shipping: 7,
            subtotal: 118,
            items: [
                {
                    id: 1,
                    name: "T-shirt Vintage Premium",
                    quantity: 2,
                    price: 45,
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                    shop: "Moda Tunis"
                },
                {
                    id: 2,
                    name: "Casquette Noire",
                    quantity: 1,
                    price: 35,
                    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                    shop: "Street Wear"
                }
            ],
            customer: {
                name: "John Doe",
                email: "john.doe@example.com",
                phone: "+216 12 345 678",
                address: "123 Rue de la République, Tunis 1001"
            },
            tracking: [
                { status: "Commande confirmée", date: "15 Oct 2023, 10:30", completed: true },
                { status: "En préparation", date: "15 Oct 2023, 14:20", completed: true },
                { status: "Expédiée", date: "16 Oct 2023, 09:15", completed: true },
                { status: "Livrée", date: "17 Oct 2023, 16:45", completed: true }
            ]
        },
        "ORD-2023-1005": {
            id: "ORD-2023-1005",
            date: "2023-11-02",
            status: "processing",
            total: 89,
            shipping: 7,
            subtotal: 82,
            items: [
                {
                    id: 3,
                    name: "Jean Slim Fit",
                    quantity: 1,
                    price: 89,
                    image: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                    shop: "Denim Store"
                }
            ],
            customer: {
                name: "John Doe",
                email: "john.doe@example.com",
                phone: "+216 12 345 678",
                address: "123 Rue de la République, Tunis 1001"
            },
            tracking: [
                { status: "Commande confirmée", date: "02 Nov 2023, 11:20", completed: true },
                { status: "En préparation", date: "02 Nov 2023, 15:30", completed: true },
                { status: "Expédiée", date: "En attente", completed: false },
                { status: "Livrée", date: "En attente", completed: false }
            ]
        }
    };
    return orders[id];
};

const OrderStatusBadge = ({ status }) => {
    const styles = {
        delivered: "bg-green-100 text-green-700",
        processing: "bg-blue-100 text-blue-700",
        cancelled: "bg-red-100 text-red-700"
    };

    const labels = {
        delivered: "Livré",
        processing: "En cours",
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

    const order = getOrderById(orderId);

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande introuvable</h2>
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande {order.id}</h1>
                        <p className="text-gray-500 flex items-center gap-2">
                            <Calendar size={16} />
                            Passée le {order.date}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <OrderStatusBadge status={order.status} />
                        <Link
                            to={`/order/${order.id}/invoice`}
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
                                {order.tracking.map((track, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${track.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {track.completed ? <CheckCircle size={20} /> : <div className="w-3 h-3 rounded-full bg-gray-300"></div>}
                                            </div>
                                            {idx < order.tracking.length - 1 && (
                                                <div className={`w-0.5 h-12 ${track.completed ? 'bg-green-200' : 'bg-gray-200'}`}></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className={`font-semibold ${track.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {track.status}
                                            </p>
                                            <p className="text-sm text-gray-500">{track.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Items */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Articles commandés</h2>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            <img src={getImgUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
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
                                    <span className="font-medium text-gray-900">{order.subtotal} TND</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Livraison</span>
                                    <span className="font-medium text-gray-900">{order.shipping} TND</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-primary text-lg">{order.total} TND</span>
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
                                    <p className="font-semibold text-gray-900">{order.customer.name}</p>
                                </div>
                                <div className="flex items-start gap-2 text-gray-600">
                                    <Mail size={16} className="mt-0.5 shrink-0" />
                                    <p>{order.customer.email}</p>
                                </div>
                                <div className="flex items-start gap-2 text-gray-600">
                                    <Phone size={16} className="mt-0.5 shrink-0" />
                                    <p>{order.customer.phone}</p>
                                </div>
                                <div className="flex items-start gap-2 text-gray-600">
                                    <MapPin size={16} className="mt-0.5 shrink-0" />
                                    <p>{order.customer.address}</p>
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
