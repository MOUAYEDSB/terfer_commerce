
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Grid, List as ListIcon, Star, Heart, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../context/WishlistContext';

import axios from 'axios';
import { getImgUrl } from '../constants/productConstants';

const ShopPage = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [searchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState(1000);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const { toggleWishlist, isInWishlist } = useWishlist();

    // Initialize filters from URL and fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const categoryParam = searchParams.get('category');
                const searchParam = searchParams.get('search');
                let url = 'http://localhost:5000/api/products?limit=50';

                if (categoryParam) {
                    url += `&category=${categoryParam}`;
                    if (!selectedCategories.includes(categoryParam)) {
                        setSelectedCategories([categoryParam]);
                    }
                } else if (selectedCategories.length > 0) {
                    url += `&category=${selectedCategories[0]}`;
                }

                if (searchParam) {
                    url += `&search=${encodeURIComponent(searchParam)}`;
                }

                const { data } = await axios.get(url);
                setProducts(data.products || []);
                setTotalProducts(data.total || 0);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams, selectedCategories]);

    const handleCategoryChange = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    // Front-end price filtering as backup/complement
    const filteredProducts = products.filter(product => {
        return product.price <= priceRange;
    });

    return (
        <div className={`bg-gray-50 min-h-screen pb-20 pt-10 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {searchParams.get('search')
                            ? `${t('shop.search_results') || 'Résultats pour'}: ${searchParams.get('search')}`
                            : t('nav.categories.all_shops')}
                    </h1>
                    <p className="text-gray-500">{t('home.categories.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="hidden lg:block space-y-6">
                        {/* Categories Filter */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900">{t('shop.categories')}</h3>
                                <Filter size={18} className="text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                {['Mode', 'High-Tech', 'Maison', 'Beauté', 'Bijoux', 'Sport', 'Enfants', 'Auto', 'Animaux'].map((cat, idx) => (
                                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                                            checked={selectedCategories.includes(cat)}
                                            onChange={() => handleCategoryChange(cat)}
                                        />
                                        <span className={`text-gray-600 group-hover:text-primary transition ${selectedCategories.includes(cat) ? 'font-bold text-primary' : ''}`}>{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">{t('shop.price')}</h3>
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-2">
                                <span>0 TND</span>
                                <span className="font-semibold text-primary">{priceRange} TND</span>
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">{t('shop.rating')}</h3>
                            <div className="space-y-2">
                                {[5, 4, 3].map((star) => (
                                    <label key={star} className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" />
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < star ? "currentColor" : "none"} className={i >= star ? "text-gray-300" : ""} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500">& plus</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Toolbar */}
                        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-gray-500 text-sm">
                                <span className="font-bold text-gray-900">{filteredProducts.length}</span> produits trouvés
                            </p>

                            <div className="flex items-center gap-4">
                                <select className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:ring-0 cursor-pointer">
                                    <option>{t('shop.sort_newest')}</option>
                                    <option>{t('shop.sort_price_asc')}</option>
                                    <option>{t('shop.sort_price_desc')}</option>
                                </select>

                                <div className="flex bg-gray-50 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <ListIcon size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {loading ? (
                                Array(6).fill(0).map((_, idx) => (
                                    <div key={idx} className="animate-pulse bg-white rounded-2xl p-4 shadow-sm h-80">
                                        <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                                        <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                                    </div>
                                ))
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <div key={product._id} className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden group ${viewMode === 'list' ? 'flex flex-row h-48' : ''}`}>
                                        <div className={`relative bg-gray-100 overflow-hidden ${viewMode === 'list' ? 'w-48 h-full' : 'h-64'}`}>
                                            <Link to={`/product/${product._id}`} className="block h-full w-full">
                                                <img src={getImgUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                            </Link>
                                            <button
                                                onClick={() => toggleWishlist({ ...product, id: product._id })}
                                                className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} p-2 bg-white/90 backdrop-blur rounded-full shadow-md transition ${isInWishlist(product._id) ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-white'}`}
                                                aria-label="Ajouter aux favoris"
                                            >
                                                <Heart size={18} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
                                            </button>
                                            {viewMode === 'grid' && (
                                                <button className={`absolute bottom-4 ${isRtl ? 'left-4' : 'right-4'} bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition duration-300 hover:bg-primary hover:text-white`}>
                                                    <ArrowRight size={20} className={isRtl ? 'rotate-180' : ''} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="p-5 flex flex-col justify-between flex-1">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide">{product.category}</p>
                                                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                                                        <Star size={12} fill="currentColor" /> {product.rating || 0}
                                                    </div>
                                                </div>
                                                <Link to={`/product/${product._id}`} className="block">
                                                    <h3 className="font-bold text-gray-900 mb-1 hover:text-primary transition line-clamp-1">{product.name}</h3>
                                                </Link>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                                                <Link to={`/shop/${product.seller?._id || product.shopId}`} className="text-xs text-gray-500 hover:underline">{t('cart.sold_by')} {product.shop}</Link>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-lg font-bold text-primary">{product.price} TND</span>
                                                {viewMode === 'list' && (
                                                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition">
                                                        {t('product.add_to_cart')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-2xl shadow-sm">
                                    <p className="text-gray-500 text-lg">Aucun produit ne correspond à vos critères.</p>
                                </div>
                            )}
                        </div>

                        {/* Load More */}
                        <div className="mt-12 text-center">
                            <button className="px-8 py-3 border border-gray-300 bg-white text-gray-700 font-bold rounded-full hover:bg-gray-50 transition">
                                {t('shop.load_more')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
