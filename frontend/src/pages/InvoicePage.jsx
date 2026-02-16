import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Printer, Mail } from 'lucide-react';

// Mock order data - même structure que OrderDetailPage
const getOrderById = (id) => {
    const orders = {
        "ORD-2023-1001": {
            id: "ORD-2023-1001",
            date: "15 Octobre 2023",
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
            }
        },
        "ORD-2023-1005": {
            id: "ORD-2023-1005",
            date: "02 Novembre 2023",
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
            }
        }
    };
    return orders[id];
};

const InvoicePage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { orderId } = useParams();

    const order = getOrderById(orderId);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Simuler le téléchargement - à implémenter avec une vraie génération PDF
        alert('Téléchargement de la facture en cours...');
    };

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Facture introuvable</h2>
                    <Link to="/profile?tab=orders" className="text-primary hover:underline">
                        Retour aux commandes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gray-50 min-h-screen py-10 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Actions - Hidden on print */}
                <div className="print:hidden mb-6 flex justify-between items-center">
                    <Link to={`/order/${orderId}`} className="inline-flex items-center text-gray-500 hover:text-primary gap-2">
                        <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} />
                        Retour aux détails
                    </Link>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                            <Printer size={16} />
                            Imprimer
                        </button>
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition flex items-center gap-2"
                        >
                            <Download size={16} />
                            Télécharger PDF
                        </button>
                    </div>
                </div>

                {/* Invoice */}
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 print:shadow-none print:rounded-none">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-gray-200">
                        <div>
                            <h1 className="text-4xl font-black text-primary mb-2">TERFER</h1>
                            <p className="text-sm text-gray-600">Marketplace Tunisienne</p>
                            <p className="text-sm text-gray-600">contact@terfer.tn</p>
                            <p className="text-sm text-gray-600">+216 70 123 456</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">FACTURE</h2>
                            <p className="text-sm text-gray-600">N° {order.id}</p>
                            <p className="text-sm text-gray-600">Date: {order.date}</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-12">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Facturé à</h3>
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <p className="font-bold text-gray-900 text-lg mb-2">{order.customer.name}</p>
                            <p className="text-gray-600 text-sm mb-1">{order.customer.address}</p>
                            <p className="text-gray-600 text-sm mb-1">{order.customer.email}</p>
                            <p className="text-gray-600 text-sm">{order.customer.phone}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-12">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-4 font-bold text-gray-700 uppercase text-sm">Article</th>
                                    <th className="text-center py-4 font-bold text-gray-700 uppercase text-sm">Qté</th>
                                    <th className="text-right py-4 font-bold text-gray-700 uppercase text-sm">Prix Unit.</th>
                                    <th className="text-right py-4 font-bold text-gray-700 uppercase text-sm">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-4">
                                            <p className="font-semibold text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">{item.shop}</p>
                                        </td>
                                        <td className="text-center py-4 text-gray-700">{item.quantity}</td>
                                        <td className="text-right py-4 text-gray-700">{item.price.toFixed(2)} TND</td>
                                        <td className="text-right py-4 font-semibold text-gray-900">{(item.price * item.quantity).toFixed(2)} TND</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-full md:w-1/2 space-y-3">
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Sous-total</span>
                                <span className="font-medium text-gray-900">{order.subtotal.toFixed(2)} TND</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Frais de livraison</span>
                                <span className="font-medium text-gray-900">{order.shipping.toFixed(2)} TND</span>
                            </div>
                            <div className="flex justify-between py-4 border-t-2 border-gray-200">
                                <span className="text-xl font-bold text-gray-900">Total TTC</span>
                                <span className="text-2xl font-black text-primary">{order.total.toFixed(2)} TND</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-8 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-500 mb-2">
                            Merci pour votre commande !
                        </p>
                        <p className="text-xs text-gray-400">
                            Cette facture a été générée électroniquement et est valable sans signature.
                        </p>
                        <p className="text-xs text-gray-400 mt-4">
                            TERFER - Marketplace Tunisienne | www.terfer.tn | contact@terfer.tn
                        </p>
                    </div>
                </div>

                {/* Print-only footer */}
                <div className="hidden print:block text-center text-xs text-gray-400 mt-4">
                    Page 1/1 - Imprimé le {new Date().toLocaleDateString('fr-FR')}
                </div>
            </div>

            {/* Print styles */}
            <style>{`
                @media print {
                    body {
                        background: white;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:rounded-none {
                        border-radius: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoicePage;
