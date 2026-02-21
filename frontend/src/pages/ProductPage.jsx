import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Truck, RotateCcw, Minus, Plus, ChevronRight, Loader2, DollarSign, Tag, Briefcase, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getColorHex, getImgUrl } from '../constants/productConstants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null); // nom couleur ou index si pas de noms
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [showFullDescription, setShowFullDescription] = useState(false);
    const tabsRef = useRef(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState(null);
    const [reviewSuccess, setReviewSuccess] = useState(null);

    const fetchProduct = useCallback(async () => {
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
    }, [id]);

    useEffect(() => {
        if (id) fetchProduct();
    }, [id, fetchProduct]);

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
        addToCart({ ...product, id: product._id }, quantity, {
            selectedColor: selectedColor ?? undefined,
            selectedSize: selectedSize ?? undefined
        });
    };

    const handleBuyNow = () => {
        if (!product) return;
        addToCart({ ...product, id: product._id }, quantity, {
            selectedColor: selectedColor ?? undefined,
            selectedSize: selectedSize ?? undefined
        });
        navigate('/checkout');
    };

    const handleReviewSubmit = async (event) => {
        event.preventDefault();
        if (!user) return;

        setReviewError(null);
        setReviewSuccess(null);

        if (!reviewComment.trim()) {
            setReviewError('Veuillez saisir un commentaire.');
            return;
        }

        if (!reviewRating || Number(reviewRating) < 1) {
            setReviewError('Veuillez choisir une note.');
            return;
        }

        setReviewSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/products/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    rating: Number(reviewRating),
                    comment: reviewComment.trim()
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Impossible d\'ajouter l\'avis.');
            }

            setReviewSuccess('Merci pour votre avis !');
            setReviewComment('');
            setReviewRating(5);
            fetchProduct();
        } catch (err) {
            setReviewError(err.message);
        } finally {
            setReviewSubmitting(false);
        }
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
    const reviews = product.reviews || [];
    const userReview = user
        ? reviews.find((review) => {
            const reviewUserId = review.user?._id || review.user;
            return reviewUserId && reviewUserId.toString() === user._id;
        })
        : null;

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
                                src={getImgUrl(product.images?.[selectedImage] || product.images?.[0])}
                                alt={product.name}
                                className="w-full h-full object-cover transition duration-300"
                            />
                            {product.oldPrice > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-lg">
                                    -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                                </div>
                            )}
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
                                        <img src={getImgUrl(img)} alt="" className="w-full h-full object-cover" />
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

                        {/* Price Section */}
                        <div className="mb-8">
                            {/* Main Price Display */}
                            <div className="bg-gradient-to-br from-primary/15 via-transparent to-primary/5 p-6 rounded-2xl mb-4 border-2 border-primary/30 shadow-md hover:shadow-lg transition">
                                <div className="flex items-center gap-10 flex-wrap">
                                    {/* Current Price */}
                                    <div className="flex flex-col">
                                        <span className="text-xs tracking-widest text-primary font-bold uppercase mb-2 flex items-center gap-2"><DollarSign size={14} /> Prix actuel</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-primary">{(product.finalPrice || product.price)?.toFixed(2)}</span>
                                            <span className="text-sm text-gray-600 font-semibold">TND</span>
                                        </div>
                                    </div>
                                    
                                    {/* Old Price */}
                                    {product.oldPrice && product.oldPrice > 0 && (
                                        <div className="border-l-2 border-primary/30 pl-10 flex flex-col">
                                            <span className="text-xs tracking-widest text-gray-500 font-bold uppercase mb-2 flex items-center gap-2"><Tag size={14} /> Ancien prix</span>
                                            <p className="text-3xl text-gray-400 font-bold line-through">{product.oldPrice} <span className="text-sm">TND</span></p>
                                        </div>
                                    )}
                                    
                                    {/* Wholesale Price */}
                                    {product.wholesalePrice && product.wholesalePrice > 0 && (
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 px-5 py-4 rounded-xl border-2 border-blue-300 shadow-sm flex items-center gap-3">
                                            <div>
                                                <span className="text-xs tracking-widest text-blue-700 font-bold uppercase block mb-2 flex items-center gap-2"><Briefcase size={14} /> Prix en gros</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-black text-blue-600">{((product.wholesalePrice * 1.20) || product.wholesalePrice)?.toFixed(2)}</span>
                                                    <span className="text-sm text-blue-600 font-semibold">TND</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-blue-700 font-semibold text-right whitespace-nowrap">
                                                À partir de<br/>10 pièces
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Description Preview with Scroll Arrow */}
                            <div className="mt-4">
                                <p className="text-gray-600 text-base leading-relaxed inline">
                                    {product.description || 'Aucune description disponible.'}
                                    {' '}
                                    <button
                                        onClick={() => {
                                            setActiveTab('description');
                                            setTimeout(() => {
                                                const element = tabsRef.current;
                                                if (element) {
                                                    const yOffset = -200;
                                                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                                    window.scrollTo({ top: y, behavior: 'smooth' });
                                                }
                                            }, 100);
                                        }}
                                        className="text-primary hover:text-primary/80 transition inline align-middle"
                                    >
                                        <ChevronDown size={20} />
                                    </button>
                                </p>
                            </div>
                            
                            <p className="text-green-600 text-sm mt-3 flex items-center gap-1">
                                <Truck size={14} /> Livraison estimee : 2-3 jours
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
                                <button
                                    onClick={handleBuyNow}
                                    disabled={availableStock === 0}
                                    className="flex-1 bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg hover:shadow-xl transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
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
                <div ref={tabsRef} className="mt-12 bg-white rounded-2xl shadow-sm p-6 md:p-10">
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
                            <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {product.description || 'Aucune description disponible.'}
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="space-y-8">
                                <div className="text-center py-6 text-gray-500">
                                    <div className="text-4xl font-bold text-gray-900 mb-2">{product.rating?.toFixed(1) || '0'}/5</div>
                                    <div className="flex justify-center text-yellow-500 mb-3">
                                        <Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" className="text-gray-300" />
                                    </div>
                                    <p>{t('product.reviews')} ({product.numReviews || 0})</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-gray-900">Avis clients</h4>
                                        {reviews.length === 0 ? (
                                            <p className="text-gray-500">Aucun avis pour le moment.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {reviews.map((review) => (
                                                    <div key={review._id || `${review.user}-${review.createdAt}`} className="border border-gray-200 rounded-xl p-4">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{review.name || 'Client'}</p>
                                                                <div className="flex items-center gap-1 text-yellow-500 mt-1">
                                                                    {Array.from({ length: 5 }).map((_, index) => (
                                                                        <Star
                                                                            key={index}
                                                                            size={14}
                                                                            fill="currentColor"
                                                                            className={index < Number(review.rating) ? 'text-yellow-500' : 'text-gray-300'}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-gray-400">
                                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('fr-FR') : ''}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 mt-3">{review.comment}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                                        <h4 className="text-lg font-bold text-gray-900 mb-3">Laisser un avis</h4>
                                        {!user ? (
                                            <p className="text-gray-600">
                                                Connectez-vous pour laisser un avis.{' '}
                                                <Link to="/login" className="text-primary font-semibold hover:underline">Se connecter</Link>
                                            </p>
                                        ) : userReview ? (
                                            <p className="text-gray-600">Vous avez deja laisse un avis sur ce produit.</p>
                                        ) : (
                                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-700 block mb-2">Note</label>
                                                    <div className="flex items-center gap-2">
                                                        {Array.from({ length: 5 }).map((_, index) => {
                                                            const value = index + 1;
                                                            return (
                                                                <button
                                                                    key={value}
                                                                    type="button"
                                                                    onClick={() => setReviewRating(value)}
                                                                    className="text-yellow-500 hover:scale-110 transition"
                                                                    aria-label={`Note ${value} sur 5`}
                                                                >
                                                                    <Star
                                                                        size={22}
                                                                        fill="currentColor"
                                                                        className={value <= Number(reviewRating) ? 'text-yellow-500' : 'text-gray-300'}
                                                                    />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{reviewRating}/5</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-700 block mb-2">Commentaire</label>
                                                    <textarea
                                                        value={reviewComment}
                                                        onChange={(event) => setReviewComment(event.target.value)}
                                                        rows={4}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-primary"
                                                        placeholder="Votre experience avec ce produit..."
                                                    />
                                                </div>
                                                {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
                                                {reviewSuccess && <p className="text-sm text-green-600">{reviewSuccess}</p>}
                                                <button
                                                    type="submit"
                                                    disabled={reviewSubmitting}
                                                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {reviewSubmitting ? 'Envoi en cours...' : 'Publier mon avis'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
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
