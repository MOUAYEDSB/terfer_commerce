
import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BrandMarquee from '../components/BrandMarquee';
import BenefitsSection from '../components/BenefitsSection';
import { ArrowRight, Star, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getImgUrl } from '../constants/productConstants';
import { useWishlist } from '../context/WishlistContext';

const categories = [
    { name: "Mode", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "1.2k" },
    { name: "Maison & Déco", image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "850" },
    { name: "High-Tech", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "500" },
    { name: "Beauté", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "320" },
    { name: "Sport", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "450" },
    { name: "Enfants", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "210" },
    { name: "Auto", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "150" },
    { name: "Animaux", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "180" }
];

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { toggleWishlist, isInWishlist } = useWishlist();

    const heroImages = [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    ];

    React.useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/products');
                setProducts(data.products || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    return (
        <div className={`animate-fade-in bg-white ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <section className="relative bg-white overflow-hidden py-16 md:py-24 min-h-[70vh] flex items-center">
                {/* Visual Depth */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50/50 -skew-x-6 origin-top-right"></div>
                </div>

                <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center relative z-10 gap-12">
                    <div className="w-full lg:w-1/2 text-center lg:text-left lg:rtl:text-right lg:-mt-32">
                        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-gray-100 mb-8">
                            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">{t('home.hero.badge')}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-8 tracking-tighter uppercase whitespace-nowrap">
                            {t('home.hero.title')}
                        </h1>

                        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                            {t('home.hero.subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                            <Link to="/shop" className="group bg-gray-900 text-white px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg">
                                {t('home.hero.cta_buy')}
                                <ArrowRight size={18} className={`transition-transform duration-300 group-hover:translate-x-2 ${isRtl ? 'rotate-180' : ''}`} />
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image / Composition */}
                    <div className="md:w-1/2 relative h-[500px] w-full flex justify-center items-center">
                        <div className="relative w-full max-w-lg aspect-square">
                            {/* Main Image Carousel */}
                            <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition duration-700 z-10 border-4 border-white group">
                                {heroImages.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`Slide ${index + 1}`}
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                ))}

                                {/* Carousel indicators */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                                    {heroImages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className={`absolute -top-6 ${isRtl ? '-left-6' : '-right-6'} z-20 bg-white p-4 rounded-2xl shadow-xl animate-bounce duration-[3000ms]`}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                                        <Star size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">4.9/5</p>
                                        <p className="text-xs text-gray-500">{t('home.hero.rating')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`absolute -bottom-10 ${isRtl ? '-right-10' : '-left-10'} z-20 bg-white p-5 rounded-2xl shadow-xl animate-bounce-short delay-700`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Shoe" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{t('home.hero.new_collection')}</p>
                                        <p className="text-xs text-primary font-bold">{t('home.hero.available_now')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand Marquee */}
            <BrandMarquee />

            {/* Categories Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">{t('home.categories.title')}</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">{t('home.categories.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categories.map((cat, idx) => (
                            <Link
                                to={`/shop?category=${cat.name === 'Électronique' ? 'High-Tech' : cat.name === 'Maison & Déco' ? 'Maison' : cat.name}`}
                                key={idx}
                                className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 block"
                            >
                                {/* Image with overlay */}
                                <div className="absolute inset-0 bg-gray-200">
                                    <img
                                        src={cat.image}
                                        alt={t(`home.categories.${cat.name}`) || cat.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Gradient Overlay - Always visible but stronger on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 w-full p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-2xl font-bold mb-1 tracking-tight">{t(`home.categories.${cat.name}`) || cat.name}</h3>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        <span className="w-8 h-0.5 bg-primary"></span>
                                        <p className="text-sm font-medium text-gray-200">{cat.count} {t('home.categories.products')}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">{t('home.new_arrivals.title')}</h2>
                        <Link to="/shop" className="text-primary font-semibold hover:underline flex items-center gap-1">
                            {t('home.new_arrivals.view_all')} <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {loading ? (
                            Array(4).fill(0).map((_, idx) => (
                                <div key={idx} className="animate-pulse bg-white rounded-2xl p-4 shadow-sm h-96">
                                    <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
                                    <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                                </div>
                            ))
                        ) : products.length > 0 ? (
                            products.map((product) => (
                                <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden group">
                                    <div className="relative h-72 bg-gray-100 overflow-hidden">
                                        <Link to={`/product/${product._id}`} className="block h-full w-full">
                                            <img src={getImgUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                        </Link>
                                        <button
                                            onClick={() => toggleWishlist({ ...product, id: product._id })}
                                            className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-full shadow-md transition ${isInWishlist(product._id) ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
                                            aria-label="Ajouter aux favoris"
                                        >
                                            <Heart size={18} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
                                        </button>
                                        <button className={`absolute bottom-4 ${isRtl ? 'left-4' : 'right-4'} bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition duration-300 hover:bg-primary hover:text-white`}>
                                            <ArrowRight size={20} className={isRtl ? 'rotate-180' : ''} />
                                        </button>
                                        <span className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                                            {product.category}
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <Link to={`/shop/${product.seller?._id || product.seller}`} className="text-sm text-gray-500 mb-1 hover:text-primary hover:underline block">{product.shop}</Link>
                                                <Link to={`/product/${product._id}`} className="text-lg font-bold text-gray-900 leading-tight hover:text-primary transition block">
                                                    {product.name}
                                                </Link>
                                                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                                <Star size={14} fill="currentColor" /> {product.rating || 0}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-xl font-bold text-primary">{(product.finalPrice || product.price)?.toFixed(2)} TND</p>
                                                {product.oldPrice && product.oldPrice > 0 && (
                                                    <p className="text-xl text-gray-400 font-semibold line-through">{product.oldPrice} TND</p>
                                                )}
                                            </div>
                                            <button className="text-sm font-semibold text-gray-900 border-b-2 border-gray-200 hover:border-gray-900 transition">
                                                {t('home.new_arrivals.add')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-gray-500">{t('home.new_arrivals.no_products')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <BenefitsSection />

            {/* Wholesale + Retail Highlight */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-10 md:p-14 text-white relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full"></div>
                        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-white/5 rounded-full"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="max-w-2xl">
                                <p className="text-xs tracking-[0.3em] uppercase text-white/70 font-bold mb-3">{t('home.wholesale.badge')}</p>
                                <h3 className="text-3xl md:text-4xl font-black mb-4">
                                    {t('home.wholesale.title')}
                                </h3>
                                <p className="text-white/80 text-lg leading-relaxed">
                                    {t('home.wholesale.subtitle')}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Link to="/shop" className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg">
                                    {t('home.wholesale.cta_retail')}
                                </Link>
                                <Link to="/shop" className="border border-white/70 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition">
                                    {t('home.wholesale.cta_wholesale')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Site Promo */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-2xl"></div>
                            <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-gray-200/60 rounded-3xl"></div>
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="TerFer marketplace"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-bold mb-3">{t('home.marketplace.badge')}</p>
                            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                                {t('home.marketplace.title')}
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                {t('home.marketplace.subtitle')}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/shop" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">
                                    {t('home.marketplace.cta_offers')}
                                </Link>
                                <Link to="/register-seller" className="border border-gray-300 text-gray-900 px-8 py-3 rounded-xl font-bold hover:border-gray-900 transition">
                                    {t('home.marketplace.cta_seller')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('home.cta_seller.title')}</h2>
                    <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">{t('home.cta_seller.subtitle')}</p>
                    <Link to="/register-seller" className="inline-block bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl">
                        {t('home.cta_seller.button')}
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
