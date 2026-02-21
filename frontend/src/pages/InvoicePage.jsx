import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Printer, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const InvoicePage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { orderId } = useParams();
    const { user } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);

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
                    throw new Error('Facture introuvable');
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

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            // Dynamic import for html2pdf
            const html2pdf = (await import('html2pdf.js')).default;
            const element = document.getElementById('invoice-content');
            
            if (!element) {
                throw new Error('Invoice element not found');
            }

            const opt = {
                margin: 10,
                filename: `Facture_${order.orderNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            };

            html2pdf().set(opt).from(element).save();
            toast.success('Facture téléchargée');
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Erreur lors du téléchargement');
        } finally {
            setDownloading(false);
        }
    };

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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Facture introuvable'}</h2>
                    <Link to="/profile?tab=orders" className="text-primary hover:underline">
                        Retour aux commandes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gray-50 min-h-screen py-10 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                {/* Actions - Hidden on print */}
                <div className="print:hidden mb-6 flex justify-between items-center">
                    <Link to={`/order/${order.orderNumber}`} className="inline-flex items-center text-gray-500 hover:text-primary gap-2">
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
                            disabled={downloading}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Génération...
                                </>
                            ) : (
                                <>
                                    <Download size={16} />
                                    Télécharger PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Invoice */}
                <div id="invoice-content" className="bg-white rounded-2xl shadow-lg p-8 md:p-12 print:shadow-none print:rounded-none">
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
                            <p className="text-sm text-gray-600">N° {order.orderNumber}</p>
                            <p className="text-sm text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-12">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Facturé à</h3>
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <p className="font-bold text-gray-900 text-lg mb-2">{order.shippingAddress.fullName}</p>
                            <p className="text-gray-600 text-sm mb-1">{order.shippingAddress.address}</p>
                            <p className="text-gray-600 text-sm mb-1">{order.shippingAddress.city}</p>
                            {order.shippingAddress.postalCode && <p className="text-gray-600 text-sm mb-1">{order.shippingAddress.postalCode}</p>}
                            <p className="text-gray-600 text-sm mb-1">{order.shippingAddress.country}</p>
                            <p className="text-gray-600 text-sm mb-1">{order.user?.email}</p>
                            <p className="text-gray-600 text-sm">{order.shippingAddress.phone}</p>
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
                                <span className="font-medium text-gray-900">{order.shippingCost.toFixed(2)} TND</span>
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
    );
};

export default InvoicePage;
