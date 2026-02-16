
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, CreditCard, Truck, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImgUrl } from '../constants/productConstants';

const CheckoutPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('summary'); // summary, success

    const shipping = cartItems.length > 0 ? 7 : 0;
    const total = cartTotal + shipping;

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setStep('success');
            clearCart();
            toast.success(t('checkout.order_success'));
        }, 2000);
    };

    if (cartItems.length === 0 && step !== 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Redirecting...</p>
                {setTimeout(() => navigate('/shop'), 1000) && null}
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('checkout.order_success')}</h2>
                    <p className="text-gray-500 mb-8">{t('checkout.order_success_msg')}</p>
                    <Link to="/" className="block w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition">
                        {t('checkout.back_home')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gray-50 min-h-screen py-10 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4">
                <Link to="/cart" className="inline-flex items-center text-gray-500 hover:text-primary mb-6 gap-2">
                    <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} />
                    {t('cart.title')}
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkout.title')}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">

                            {/* Contact Info */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout.contact_info')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.form.email')}</label>
                                        <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.form.first_name')}</label>
                                        <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.form.last_name')}</label>
                                        <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.form.phone')}</label>
                                        <input type="tel" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout.shipping_address')}</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.form.address')}</label>
                                        <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.form.city')}</label>
                                        <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout.payment_method')}</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition border-primary bg-primary/5">
                                        <input type="radio" name="payment" defaultChecked className="h-5 w-5 text-primary focus:ring-primary" />
                                        <div className="flex items-center gap-3 ml-3 rtl:mr-3 rtl:ml-0">
                                            <Truck className="text-gray-600" />
                                            <span className="font-medium text-gray-900">{t('checkout.cod')}</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition opacity-60">
                                        <input type="radio" name="payment" disabled className="h-5 w-5 text-primary focus:ring-primary" />
                                        <div className="flex items-center gap-3 ml-3 rtl:mr-3 rtl:ml-0">
                                            <CreditCard className="text-gray-600" />
                                            <span className="font-medium text-gray-900">{t('checkout.card')} (Bientôt)</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Résumé ({cartItems.length})</h2>

                            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-start py-2 border-b border-dashed border-gray-100 last:border-0">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                            <img src={getImgUrl(item.image || (item.images && item.images[0]))} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{item.name}</h4>
                                            <p className="text-xs text-gray-500">{item.brand || 'Boutique'}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-gray-900 mb-1">{(item.price * item.quantity).toFixed(0)} TND</p>
                                            <p className="text-xs text-gray-500 font-medium">x {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{t('cart.subtotal')}</span>
                                    <span className="font-medium text-gray-900">{cartTotal.toFixed(0)} TND</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{t('cart.shipping')}</span>
                                    <span className="font-medium text-green-600">{shipping === 0 ? 'Gratuit' : `${shipping.toFixed(0)} TND`}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 mt-2 flex justify-between items-center">
                                    <span className="text-base font-bold text-gray-900">{t('cart.total')}</span>
                                    <span className="text-xl font-black text-primary">{total.toFixed(0)} TND</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition shadow-lg hover:shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        {t('checkout.place_order')}
                                        <ArrowRight size={20} className={`transform transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-400 mt-4">
                                <CheckCircle size={12} className="inline mr-1" /> Paiement sécurisé à la livraison
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
