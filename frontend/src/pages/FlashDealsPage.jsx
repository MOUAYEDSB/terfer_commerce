import React, { useEffect, useState } from 'react';
import { API_URL } from '../constants/api';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Heart, Star, Zap } from 'lucide-react';
import { getImgUrl } from '../constants/productConstants';
import { useWishlist } from '../context/WishlistContext';

const FlashDealsPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const response = await fetch(`${API_URL}/api/products/flash-deals?limit=40`);
                const data = await response.json();
                setDeals(data?.products || []);
            } catch (error) {
                console.error('Error fetching flash deals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, []);

    return (
        <div className={`min-h-screen bg-white ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <section className="py-14 bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider mb-3">
                                <Zap size={14} />
                                {t('home.flash_deals.badge', 'Vente Flash')}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                                {t('home.flash_deals.title', 'Offres Éclair - Offres Limitées')}
                            </h1>
                            <p className="text-gray-600">
                                {t('home.flash_deals.subtitle', 'Ne manquez pas ces offres incroyables')}
                            </p>
                        </div>

                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-gray-800 transition"
                        >
                            {t('home.new_arrivals.view_all', 'Voir tout')}
                            <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {Array(8).fill(0).map((_, idx) => (
                                <div key={idx} className="animate-pulse bg-white rounded-2xl p-4 shadow-sm h-96 border border-gray-100">
                                    <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
                                    <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : deals.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {deals.map((deal) => (
                                <div key={deal._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden group border border-gray-100">
                                    <div className="relative h-72 bg-gray-100 overflow-hidden">
                                        <Link to={`/product/${deal._id}`} className="block h-full w-full">
                                            <img src={getImgUrl(deal.images?.[0])} alt={deal.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                        </Link>
                                        <button
                                            onClick={() => toggleWishlist({ ...deal, id: deal._id })}
                                            className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-full shadow-md transition ${isInWishlist(deal._id) ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-primary'}`}
                                            aria-label="Ajouter aux favoris"
                                        >
                                            <Heart size={18} fill={isInWishlist(deal._id) ? 'currentColor' : 'none'} />
                                        </button>

                                        <span className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                                            -{deal.discountPercent || 0}%
                                        </span>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <Link to={`/shop/${deal.seller?._id || deal.seller}`} className="text-sm text-primary/80 mb-1 hover:text-primary hover:underline block">{deal.shop}</Link>
                                                <Link to={`/product/${deal._id}`} className="text-lg font-bold text-gray-900 leading-tight hover:text-primary transition block">
                                                    {deal.name}
                                                </Link>
                                                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{deal.description}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                                <Star size={14} fill="currentColor" /> {deal.rating || 0}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-xl font-bold text-primary">{(deal.finalPrice || deal.price)?.toFixed(2)} TND</p>
                                                {deal.oldPrice && deal.oldPrice > 0 && (
                                                    <p className="text-base text-gray-400 font-semibold line-through">{deal.oldPrice} TND</p>
                                                )}
                                            </div>
                                            <Link to={`/product/${deal._id}`} className="text-sm font-semibold text-gray-900 border-b-2 border-gray-200 hover:border-gray-900 transition">
                                                {t('home.new_arrivals.add', 'Ajouter')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-gray-600">{t('home.new_arrivals.no_products', 'Aucun produit trouvé')}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default FlashDealsPage;
