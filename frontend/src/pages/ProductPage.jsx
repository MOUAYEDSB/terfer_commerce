import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Truck, RotateCcw, Minus, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getColorHex } from '../constants/productConstants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { id } = useParams();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null); // nom couleur ou index si pas de noms
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${API_URL}/api/products/${id}`);
                if (!res.ok) throw new Error('Produit introuvable');
                const data = await res.json();
                setProduct(data);
                if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
                if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    const stockByColor = product?.stockByColor || {};
    const stockBySize = product?.stockBySize || {};
    const hasVariants = product?.variants && product.variants.length > 0;

    const availableStock = (() => {
        if (!product) return 0;
        if (hasVariants && selectedColor != null && selectedSize != null) {
            const v = product.variants.find(
                (x) => x.color === selectedColor && x.size === selectedSize
            );
            return v ? v.quantity : 0;
        }
        return product.stock || 0;
    })();

    const handleQuantityChange = (type) => {
        if (type === 'dec' && quantity > 1) setQuantity(quantity - 1);
        if (type === 'inc' && quantity < availableStock) setQuantity(quantity + 1);
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity, {
            selectedColor: selectedColor ?? undefined,
            selectedSize: selectedSize ?? undefined
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }
    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">{error || 'Produit introuvable'}</p>
            </div>
        );
    }

    const colors = product.colors || [];
    const sizes = product.sizes || [];

    return (
        <div className={`bg-gray-50 min-h-screen py-10 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4">

                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-500 mb-6 gap-2">
                    <span className="hover:text-primary cursor-pointer">{product.category}</span>
                    <ChevronRight size={16} className={isRtl ? 'rotate-180' : ''} />
                    <span className="text-gray-900 font-medium truncate">{product.name}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group">
                            <img
                                src={product.images?.[selectedImage] || product.images?.[0]}
                                alt={product.name}
                                className="w-full h-full object-cover transition duration-300"
                            />
                            <button
                                onClick={() => toggleWishlist({ ...product, id: product._id })}
                                className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition ${isInWishlist(product._id) ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
                            >
                                <Heart size={20} fill={isInWishlist(product._id) ? "currentColor" : "none"} />
                            </button>
                        </div>
                        {product.images?.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition ${selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col">
                        <div className="flex justify-between items-start">
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                            {/* Share button could go here */}
                        </div>

                        {/* Rating & Seller */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <div className="flex items-center text-yellow-500 font-bold gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                                <Star size={16} fill="currentColor" /> {product.rating?.toFixed(1) || '0'}
                            </div>
                            <span>|</span>
                            <span className="flex items-center gap-1">
                                {t('product.seller')} :
                                <Link to={product.seller?._id ? `/shop/${product.seller._id}` : '#'} className="text-primary font-semibold hover:underline">
                                    {product.seller?.shopName || product.seller?.name || product.shop}
                                </Link>
                            </span>
                        </div>

                        {/* Price */}
                        <div className="mb-8">
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-bold text-primary">{product.price} TND</span>
                                {product.oldPrice > 0 && (
                                    <>
                                        <span className="text-xl text-gray-400 line-through mb-1">{product.oldPrice} TND</span>
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold mb-2">
                                            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                                <Truck size={14} /> {t('product.delivery_info')}
                            </p>
                        </div>

                        {/* Options: Color & Size + Stock par couleur / taille */}
                        <div className="space-y-6 mb-8 border-y border-gray-100 py-6">
                            {colors.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('product.select_color')}</h3>
                                    <div className="flex flex-wrap gap-3 items-center">
                                        {colors.map((colorName) => (
                                            <button
                                                key={colorName}
                                                onClick={() => setSelectedColor(colorName)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition ${selectedColor === colorName ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                                                    style={{ backgroundColor: getColorHex(colorName) }}
                                                />
                                                <span className="text-sm font-medium">{colorName}</span>
                                                {hasVariants && (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                        {stockByColor[colorName] ?? 0} en stock
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {sizes.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('product.select_size')}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`h-10 min-w-[3rem] px-3 rounded-lg border font-medium transition flex items-center gap-2 ${selectedSize === size ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-600 hover:border-primary'}`}
                                            >
                                                {size}
                                                {hasVariants && (
                                                    <span className={`text-xs ${selectedSize === size ? 'text-white/90' : 'text-gray-500'}`}>
                                                        ({stockBySize[size] ?? 0})
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quantity & Actions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4 flex-wrap">
                                <h3 className="text-sm font-semibold text-gray-900">{t('product.quantity')}</h3>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button onClick={() => handleQuantityChange('dec')} className="p-2 hover:text-primary"><Minus size={16} /></button>
                                    <span className="w-12 text-center font-semibold">{quantity}</span>
                                    <button onClick={() => handleQuantityChange('inc')} className="p-2 hover:text-primary"><Plus size={16} /></button>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {availableStock > 0 ? (
                                        hasVariants && selectedColor != null && selectedSize != null
                                            ? `${availableStock} ${t('product.stock')} (${selectedColor} / ${selectedSize})`
                                            : `${product.stock} ${t('product.stock')}`
                                    ) : t('product.out_of_stock')}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={availableStock === 0}
                                    className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart size={20} />
                                    {t('product.add_to_cart')}
                                </button>
                                <button disabled={availableStock === 0} className="flex-1 bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg hover:shadow-xl transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                                    {t('product.buy_now')}
                                </button>
                            </div>

                            <div className="pt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
                                <span className="flex items-center gap-2"><Truck size={16} /> {t('home.benefits.delivery_title')}</span>
                                <span className="flex items-center gap-2"><RotateCcw size={16} /> {t('product.return_policy')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section (Desc, Reviews, etc) */}
                <div className="mt-12 bg-white rounded-2xl shadow-sm p-6 md:p-10">
                    <div className="flex gap-8 border-b border-gray-200 mb-6 overflow-x-auto">
                        {['description', 'reviews', 'seller'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-lg font-semibold transition whitespace-nowrap ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-700'}`}
                            >
                                {t(`product.${tab}`)}
                            </button>
                        ))}
                    </div>

                    <div className="animate-fade-in">
                        {activeTab === 'description' && (
                            <div className="prose max-w-none text-gray-600 leading-relaxed">
                                <p>{product.description}</p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                <ul className="list-disc pl-5 mt-4 space-y-2">
                                    <li>Matière respirante et durable</li>
                                    <li>Coutures renforcées</li>
                                    <li>Design unique et intemporel</li>
                                    <li>Lavable en machine à 30°C</li>
                                </ul>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="text-center py-10 text-gray-500">
                                <div className="text-4xl font-bold text-gray-900 mb-2">{product.rating?.toFixed(1) || '0'}/5</div>
                                <div className="flex justify-center text-yellow-500 mb-4">
                                    <Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" className="text-gray-300" />
                                </div>
                                <p>{t('product.reviews')} ({product.numReviews || 0})</p>
                            </div>
                        )}
                        {activeTab === 'seller' && product.seller && (
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center font-bold text-2xl text-gray-500">
                                    {(product.seller.name || product.seller.shopName || '?').charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{product.seller.shopName || product.seller.name}</h3>
                                    <p className="text-gray-500">{product.seller.shopDescription || 'Vendeur TerFer'}</p>
                                    <Link to={product.seller._id ? `/shop/${product.seller._id}` : '#'} className="inline-block mt-2 text-primary text-sm font-semibold border border-primary px-4 py-1 rounded-full hover:bg-primary hover:text-white transition">
                                        Voir la boutique
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductPage;
