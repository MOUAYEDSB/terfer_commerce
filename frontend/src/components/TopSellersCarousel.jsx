import React, { useEffect, useState } from 'react';
import { API_URL } from '../constants/api';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';

const TopSellersCarousel = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopSellers = async () => {
            try {
                const response = await fetch(`${API_URL}/api/products/top-sellers?limit=8`);
                const data = await response.json();
                
                if (data.success && data.sellers) {
                    // Format sellers data with images
                    const formattedSellers = data.sellers.map(seller => ({
                        _id: seller._id,
                        name: seller.shopName,
                        products: seller.totalProducts,
                        rating: seller.avgRating,
                        reviews: seller.totalReviews,
                        verified: seller.isVerified,
                        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.shopName || 'Seller')}&background=random&size=200`
                    }));
                    setSellers(formattedSellers);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching sellers:', error);
                setLoading(false);
            }
        };

        fetchTopSellers();
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">{t('home.top_sellers.title')}</h2>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (sellers.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                        {t('home.top_sellers.badge')}
                    </span>
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">{t('home.top_sellers.title')}</h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        {t('home.top_sellers.subtitle')}
                    </p>
                </div>

                {/* Sellers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sellers.map((seller, idx) => (
                        <div
                            key={seller._id || idx}
                            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
                        >
                            {/* Background */}
                            <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>

                            {/* Content */}
                            <div className="px-6 py-6 text-center -mt-12 relative z-10">
                                {/* Avatar */}
                                <div className="mb-4">
                                    <img
                                        src={seller.image}
                                        alt={seller.name}
                                        className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg object-cover group-hover:scale-110 transition"
                                    />
                                </div>

                                {/* Verified Badge */}
                                {seller.verified && (
                                    <div className="absolute top-6 right-6 bg-blue-500 text-white rounded-full p-1" title="Vendeur Vérifié">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}

                                {/* Name */}
                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                    {seller.name}
                                </h3>

                                {/* Rating */}
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                className={
                                                    i < Math.floor(seller.rating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                }
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {seller.rating.toFixed(1)}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-center gap-3 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
                                    <div className="flex items-center gap-1">
                                        <ShoppingBag size={16} className="text-blue-500" />
                                        <span className="font-semibold">{seller.products} {t('home.top_sellers.products')}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-900">{seller.reviews || 0}+ {t('home.top_sellers.reviews')}</span>
                                    </div>
                                </div>

                                {/* CTA */}
                                <Link
                                    to={`/shop/${seller._id}`}
                                    className="inline-flex items-center gap-2 w-full justify-center bg-blue-500 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition text-sm"
                                >
                                    {t('home.top_sellers.visit_shop')}
                                    <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All CTA */}
                <div className="text-center mt-16">
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
                    >
                        {t('home.top_sellers.view_all')}
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TopSellersCarousel;
