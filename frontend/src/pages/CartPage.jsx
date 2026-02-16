
import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { getImgUrl } from '../constants/productConstants';

const CartPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

    // Fixed shipping cost for now
    const shipping = cartItems.length > 0 ? 7 : 0;
    const total = cartTotal + shipping;

    if (cartItems.length === 0) {
        return (
            <div className={`min-h-[60vh] flex flex-col items-center justify-center text-center px-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="bg-gray-100 p-6 rounded-full mb-6">
                    <ShoppingBag size={64} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h2>
                <p className="text-gray-500 mb-8 max-w-md">
                    Il semble que vous n'ayez encore rien ajouté. Explorez nos catégories pour trouver votre bonheur !
                </p>
                <Link to="/shop" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition shadow-lg hover:shadow-primary/30 flex items-center gap-2">
                    {t('cart.start_shopping')} <ArrowRight size={20} className={isRtl ? 'rotate-180' : ''} />
                </Link>
            </div>
        );
    }

    return (
        <div className={`bg-gray-50 min-h-screen py-10 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.title')} ({cartItems.length})</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="lg:w-2/3 space-y-4">
                        {cartItems.map((item) => (
                            <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-6 animate-fade-in">
                                {/* Image */}
                                <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                    <img src={getImgUrl(item.images ? item.images[0] : item.image)} alt={item.name} className="w-full h-full object-cover" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                                <p className="text-xs text-gray-400 line-clamp-1 mb-1">{item.description}</p>
                                                <p className="text-sm text-gray-500">{t('cart.sold_by')} <Link to={`/shop/${item.seller?.id || 1}`} className="text-primary hover:underline">{item.seller?.name || item.shop || "Vendeur"}</Link></p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id, { selectedColor: item.selectedColor, selectedSize: item.selectedSize })}
                                                className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {item.selectedSize && (
                                                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    Taille: {item.selectedSize}
                                                </span>
                                            )}
                                            {item.selectedColor && (
                                                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1">
                                                    Couleur: <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.selectedColor }}></div>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1, { selectedColor: item.selectedColor, selectedSize: item.selectedSize })}
                                                className="p-1.5 hover:text-primary disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1, { selectedColor: item.selectedColor, selectedSize: item.selectedSize })}
                                                className="p-1.5 hover:text-primary"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <div className="text-xl font-bold text-primary">
                                            {(item.price * item.quantity).toFixed(0)} TND
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('cart.total')}</h2>

                            <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>{t('cart.subtotal')}</span>
                                    <span className="font-semibold">{cartTotal.toFixed(0)} TND</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>{t('cart.shipping')}</span>
                                    <span className="font-semibold">{shipping === 0 ? t('cart.free_shipping') : `${shipping} TND`}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-2xl font-bold text-gray-900 mb-8">
                                <span>{t('cart.total')}</span>
                                <span>{total.toFixed(0)} TND</span>
                            </div>

                            <Link to="/checkout" className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg hover:shadow-primary/30 mb-4 flex justify-center items-center gap-2 group">
                                {t('cart.checkout')} <ArrowRight size={20} className={`group-hover:translate-x-1 transition ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                            </Link>

                            <div className="text-center">
                                <Link to="/shop" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1">
                                    {t('cart.continue_shopping')}
                                </Link>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                    🔒 {t('cart.secure_payment')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
