import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImgUrl } from '../constants/productConstants';
import { 
    Star, 
    ShoppingBag, 
    Users, 
    MapPin, 
    ChevronLeft, 
    ChevronRight, 
    BadgeCheck,
    TrendingUp,
    Heart
} from 'lucide-react';

const FeaturedSellersSection = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchFeaturedSellers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products/top-sellers?limit=6');
                const data = await response.json();
                
                if (data.success && data.sellers) {
                    const formattedSellers = data.sellers.map(seller => ({
                        _id: seller._id,
                        name: seller.shopName || 'Vendeur Premium',
                        description: seller.shopDescription || t('featured_sellers.default_description'),
                        banner: seller.shopBanner
                            ? getImgUrl(seller.shopBanner)
                            : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.shopName || 'Seller')}&background=random&size=200`,
                        city: seller.shopCity || t('featured_sellers.location_unknown'),
                        products: seller.totalProducts,
                        rating: seller.avgRating,
                        reviews: seller.totalReviews,
                        followers: seller.followersCount || 0,
                        sales: seller.totalSales || 0,
                        verified: seller.isVerified,
                        memberSince: seller.memberSince ? new Date(seller.memberSince).getFullYear() : 2024
                    }));
                    setSellers(formattedSellers);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching featured sellers:', error);
                setLoading(false);
            }
        };

        fetchFeaturedSellers();
    }, [t]);

    const scrollToIndex = (index) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const card = container.firstElementChild;
            const cardWidth = card ? card.clientWidth + 32 : container.offsetWidth;
            container.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth'
            });
            setCurrentIndex(index);
        }
    };

    const handlePrev = () => {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : sellers.length - 1;
        scrollToIndex(newIndex);
    };

    const handleNext = () => {
        const newIndex = currentIndex < sellers.length - 1 ? currentIndex + 1 : 0;
        scrollToIndex(newIndex);
    };

    if (loading) {
        return (
            <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-blue-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">{t('featured_sellers.title')}</h2>
                        <div className="flex justify-center gap-2 mt-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-64 h-96 bg-gray-200 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (sellers.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-blue-50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold tracking-wide uppercase mb-6">
                        <TrendingUp size={16} />
                        <span>{t('featured_sellers.badge')}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        {t('featured_sellers.title')}
                    </h2>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        {t('featured_sellers.subtitle')}
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative max-w-7xl mx-auto">
                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrev}
                        className={`hidden md:block absolute ${isRtl ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-900 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ${isRtl ? '-mr-4' : '-ml-4'}`}
                        aria-label="Previous seller"
                    >
                        <ChevronLeft size={24} className={isRtl ? 'rotate-180' : ''} />
                    </button>
                    
                    <button
                        onClick={handleNext}
                        className={`hidden md:block absolute ${isRtl ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-900 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ${isRtl ? '-ml-4' : '-mr-4'}`}
                        aria-label="Next seller"
                    >
                        <ChevronRight size={24} className={isRtl ? 'rotate-180' : ''} />
                    </button>

                    {/* Sellers Carousel */}
                    <div 
                        ref={scrollContainerRef}
                        className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {sellers.map((seller) => (
                            <div
                                key={seller._id}
                                className="w-full flex-shrink-0 md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] snap-center"
                            >
                                <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/60 hover:border-primary/30 h-full">
                                    {/* Banner Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={seller.banner}
                                            alt={`${seller.name} banner`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                        
                                        {/* Verified Badge */}
                                        {seller.verified && (
                                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                                                <BadgeCheck size={16} className="text-blue-500" />
                                                <span className="text-xs font-bold text-gray-900">{t('featured_sellers.verified')}</span>
                                            </div>
                                        )}

                                        {/* Avatar */}
                                        <div className="absolute -bottom-12 left-6">
                                            <img
                                                src={seller.avatar}
                                                alt={seller.name}
                                                className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="pt-16 px-6 pb-6">
                                        {/* Name & Location */}
                                        <div className="mb-4">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-1">
                                                {seller.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin size={16} className="text-primary" />
                                                <span className="text-sm">{seller.city}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">
                                                    {t('featured_sellers.member_since')} {seller.memberSince}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={
                                                            i < Math.floor(seller.rating)
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-300'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-lg font-bold text-gray-900">
                                                {seller.rating.toFixed(1)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                ({seller.reviews} {t('featured_sellers.reviews')})
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">
                                            {seller.description}
                                        </p>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="text-center">
                                                <div className="flex items-center justify-center text-primary mb-1">
                                                    <ShoppingBag size={18} />
                                                </div>
                                                <div className="text-xl font-bold text-gray-900">{seller.products}</div>
                                                <div className="text-xs text-gray-500">{t('featured_sellers.products')}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center text-primary mb-1">
                                                    <Users size={18} />
                                                </div>
                                                <div className="text-xl font-bold text-gray-900">{seller.followers}</div>
                                                <div className="text-xs text-gray-500">{t('featured_sellers.followers')}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center text-primary mb-1">
                                                    <TrendingUp size={18} />
                                                </div>
                                                <div className="text-xl font-bold text-gray-900">{seller.sales}</div>
                                                <div className="text-xs text-gray-500">{t('featured_sellers.sales')}</div>
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <Link
                                            to={`/shop/${seller._id}`}
                                            className="block w-full text-center bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl group-hover:scale-[1.02]"
                                        >
                                            {t('featured_sellers.visit_shop')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-2 mt-8">
                        {sellers.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToIndex(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === currentIndex 
                                        ? 'w-8 bg-primary' 
                                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`Go to seller ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
                    >
                        <span>{t('featured_sellers.view_all')}</span>
                        <ChevronRight size={20} className={isRtl ? 'rotate-180' : ''} />
                    </Link>
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
};

export default FeaturedSellersSection;
