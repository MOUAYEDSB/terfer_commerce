import React, { useEffect, useState } from 'react';
import { API_URL } from '../constants/api';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Star, Heart, ShoppingCart } from 'lucide-react';
import { getImgUrl } from '../constants/productConstants';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const FlashDealsSection = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [endTime, setEndTime] = useState(null);
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    // Calculate time remaining until specific endTime
    const getTimeRemaining = (target) => {
        if (!target) return { hours: 0, minutes: 0, seconds: 0 };
        const now = new Date();
        const end = new Date(target);
        const diff = end - now;
        if (diff <= 0) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }
        return {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000)
        };
    };

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const response = await fetch(`${API_URL}/api/products/flash-deals?limit=8`);
                const data = await response.json();
                
                if (data.success && data.products) {
                    setDeals(data.products);
                    // Prend la date de fin la plus proche parmi les deals
                    const activeEnds = data.products
                        .map(p => p.flashDealEnd)
                        .filter(Boolean)
                        .map(d => new Date(d).getTime());
                    if (activeEnds.length > 0) {
                        const nearest = new Date(Math.min(...activeEnds));
                        setEndTime(nearest.toISOString());
                        setCountdown(getTimeRemaining(nearest));
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching flash deals:', error);
                setLoading(false);
            }
        };

        fetchDeals();
    }, []);

    // Update countdown every second based on endTime
    useEffect(() => {
        if (!endTime) return;
        const interval = setInterval(() => {
            setCountdown(getTimeRemaining(endTime));
        }, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    const handleAddToCart = (deal) => {
        addToCart({
            id: deal._id,
            name: deal.name,
            price: deal.finalPrice || deal.price,
            image: deal.images?.[0],
            quantity: 1
        });
    };

    if (loading) {
        return (
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-600">Loading flash deals...</p>
                </div>
            </section>
        );
    }

    // Si aucune deal active ou le compte à rebours est terminé, ne rien afficher
    if (deals.length === 0 || (countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0)) {
        return null;
    }

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Header with countdown */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-primary text-white rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                        <Zap size={14} className="inline mr-2" />
                        {t('home.flash_deals.badge', 'Vente Flash')}
                    </span>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        {t('home.flash_deals.title', 'Flash Deals - Offres Limitées')}
                    </h2>
                    <p className="text-gray-600 text-lg mb-6">
                        {t('home.flash_deals.subtitle', 'Ne manquez pas ces offres incroyables')}
                    </p>

                    {/* Countdown timer */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="bg-white rounded-xl shadow-sm px-6 py-4 border border-gray-100">
                            <div className="text-3xl font-bold text-primary">{String(countdown.hours).padStart(2, '0')}</div>
                            <div className="text-xs text-gray-500 uppercase">{t('home.flash_deals.hours', 'Heures')}</div>
                        </div>
                        <div className="text-2xl font-bold text-gray-400">:</div>
                        <div className="bg-white rounded-xl shadow-sm px-6 py-4 border border-gray-100">
                            <div className="text-3xl font-bold text-primary">{String(countdown.minutes).padStart(2, '0')}</div>
                            <div className="text-xs text-gray-500 uppercase">{t('home.flash_deals.minutes', 'Minutes')}</div>
                        </div>
                        <div className="text-2xl font-bold text-gray-400">:</div>
                        <div className="bg-white rounded-xl shadow-sm px-6 py-4 border border-gray-100">
                            <div className="text-3xl font-bold text-primary">{String(countdown.seconds).padStart(2, '0')}</div>
                            <div className="text-xs text-gray-500 uppercase">{t('home.flash_deals.seconds', 'Secondes')}</div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {deals.map((deal) => (
                        <div
                            key={deal._id}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                        >
                            {/* Discount Badge */}
                            <div className="absolute top-4 left-4 z-10 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                <Zap size={14} />
                                -{deal.discountPercent}%
                            </div>

                            {/* Wishlist Button */}
                            <button
                                onClick={() => toggleWishlist({ ...deal, id: deal._id })}
                                className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-md transition ${
                                    isInWishlist(deal._id) 
                                        ? 'bg-red-50 text-red-500' 
                                        : 'bg-white text-gray-400 hover:text-primary'
                                }`}
                                aria-label="Add to wishlist"
                            >
                                <Heart size={18} fill={isInWishlist(deal._id) ? 'currentColor' : 'none'} />
                            </button>

                            {/* Product Image */}
                            <Link to={`/product/${deal._id}`} className="block relative h-64 bg-gray-100 overflow-hidden">
                                <img
                                    src={getImgUrl(deal.images?.[0])}
                                    alt={deal.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                />
                            </Link>

                            {/* Product Info */}
                            <div className="p-5">
                                <Link to={`/product/${deal._id}`} className="block mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition">
                                        {deal.name}
                                    </h3>
                                </Link>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                className={
                                                    i < Math.floor(deal.rating || 0)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                }
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">({deal.rating || 0})</span>
                                </div>

                                {/* Price */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-2xl font-bold text-primary">
                                            {(deal.finalPrice || deal.price)?.toFixed(2)} TND
                                        </div>
                                        {deal.oldPrice && (
                                            <div className="text-sm text-gray-400 line-through">
                                                {deal.oldPrice?.toFixed(2)} TND
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={() => handleAddToCart(deal)}
                                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart size={18} />
                                    {t('home.flash_deals.add_to_cart', 'Ajouter')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All CTA */}
                <div className="text-center mt-12">
                    <Link
                        to="/flash-deals"
                        className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg"
                    >
                        {t('home.flash_deals.view_all', 'Voir toutes les offres')}
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FlashDealsSection;
