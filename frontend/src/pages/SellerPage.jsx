import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
    MapPin, Star, Heart, ShoppingBag, Users, TrendingUp,
    Award, Clock, Mail, Phone, MapPinned, Check, X,
    Filter, Grid, List as ListIcon, Loader2, MessageCircle
} from 'lucide-react';
import { getImgUrl } from '../constants/productConstants';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

const SellerPage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const { user } = useAuth();
    const { toggleWishlist, isInWishlist } = useWishlist();
    
    const [seller, setSeller] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products'); // products, about, reviews
    const [isFollowing, setIsFollowing] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('relevance');
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                setLoading(true);
                
                // Fetch seller info
                const sellerRes = await axios.get(`http://localhost:5000/api/users/seller/${id}`);
                setSeller(sellerRes.data);

                // Check if current user follows this seller
                if (user && sellerRes.data.followers) {
                    setIsFollowing(sellerRes.data.followers.some(f => f === user._id));
                }

                // Fetch seller statistics
                const statsRes = await axios.get(`http://localhost:5000/api/users/seller/${id}/statistics`);
                setStatistics(statsRes.data.statistics);

                // Fetch seller products
                const productsRes = await axios.get(`http://localhost:5000/api/products?seller=${id}`);
                setProducts(productsRes.data.products || []);

                // Fetch seller reviews
                const reviewsRes = await axios.get(`http://localhost:5000/api/users/seller/${id}/reviews?limit=5`);
                setReviews(reviewsRes.data.reviews || []);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching seller data:', error);
                setLoading(false);
            }
        };

        if (id) {
            fetchSellerData();
        }
    }, [id, user]);

    const handleFollowToggle = async () => {
        if (!user) {
            toast.error('Please login to follow sellers');
            return;
        }

        try {
            const { data } = await axios.post(
                `http://localhost:5000/api/users/seller/${id}/follow`,
                {},
                {
                    withCredentials: true
                }
            );

            setIsFollowing(data.following);
            setSeller(prev => ({
                ...prev,
                followersCount: data.followersCount
            }));
            toast.success(data.following ? 'Following seller!' : 'Unfollowed seller');
        } catch (error) {
            console.error('Error toggling follow:', error);
            toast.error('Failed to update follow status');
        }
    };

    // Filter and sort products
    const getFilteredProducts = () => {
        let filtered = [...products];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Sort products
        if (sortBy === 'price_asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating') {
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return filtered;
    };

    // Get unique categories from products
    const categories = ['all', ...new Set(products.map(p => p.category))];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Boutique non trouvée</h2>
                <p className="text-gray-600 mb-6">Désolé, nous n'avons pas pu trouver cette boutique.</p>
                <Link to="/" className="bg-primary text-white px-6 py-2 rounded-full font-bold">
                    Retour à l'accueil
                </Link>
            </div>
        );
    }

    const filteredProducts = getFilteredProducts();

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Banner */}
            <div className="h-64 md:h-80 w-full relative bg-gradient-to-r from-primary to-primary/80">
                {seller.shopBanner && (
                    <img
                        src={getImgUrl(seller.shopBanner)}
                        alt="Seller Banner"
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            {/* Seller Info Header */}
            <div className="container mx-auto px-4 -mt-24 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Logo */}
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 shrink-0">
                                <img
                                    src={seller.shopLogo ? getImgUrl(seller.shopLogo) : `https://ui-avatars.com/api/?name=${seller.shopName || seller.name}&background=random&size=200`}
                                    alt={seller.shopName || seller.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {seller.isVerifiedSeller && (
                                <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-lg" title="Verified Seller">
                                    <Check size={18} />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                    {seller.shopName || seller.name}
                                </h1>
                                {seller.isVerifiedSeller && (
                                    <Award className="text-primary" size={24} />
                                )}
                            </div>
                            
                            <p className="text-gray-600 mb-4 max-w-2xl leading-relaxed">
                                {seller.shopDescription || "Aucune description disponible pour cette boutique."}
                            </p>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm mb-4">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-primary" />
                                    <span className="text-gray-700">{seller.location || "Tunisia"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star size={16} className="text-primary fill-current" />
                                    <span className="font-bold text-gray-900">{seller.avgRating || 0}</span>
                                    <span className="text-gray-500">({seller.totalReviews || 0} avis)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-primary" />
                                    <span className="font-bold text-gray-900">{seller.followersCount || 0}</span>
                                    <span className="text-gray-500">abonnés</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-primary" />
                                    <span className="text-gray-700">
                                        Membre depuis {new Date(seller.joinedDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <button
                                    onClick={handleFollowToggle}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition shadow-md ${
                                        isFollowing
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-primary text-white hover:bg-primary/90'
                                    }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <Check size={18} />
                                            Abonné
                                        </>
                                    ) : (
                                        <>
                                            <Heart size={18} />
                                            Suivre
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowContactModal(true)}
                                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-md"
                                >
                                    <MessageCircle size={18} />
                                    Contacter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    {statistics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
                            <div className="text-center p-4 bg-primary/10 rounded-xl">
                                <ShoppingBag className="mx-auto mb-2 text-primary" size={24} />
                                <p className="text-2xl font-bold text-gray-900">{statistics.totalProducts}</p>
                                <p className="text-sm text-gray-600">Produits</p>
                            </div>
                            <div className="text-center p-4 bg-primary/10 rounded-xl">
                                <TrendingUp className="mx-auto mb-2 text-primary" size={24} />
                                <p className="text-2xl font-bold text-gray-900">{statistics.totalSales}</p>
                                <p className="text-sm text-gray-600">Ventes</p>
                            </div>
                            <div className="text-center p-4 bg-primary/10 rounded-xl">
                                <Star className="mx-auto mb-2 text-primary" size={24} />
                                <p className="text-2xl font-bold text-gray-900">{statistics.avgRating.toFixed(1)}</p>
                                <p className="text-sm text-gray-600">Note Moyenne</p>
                            </div>
                            <div className="text-center p-4 bg-primary/10 rounded-xl">
                                <Users className="mx-auto mb-2 text-primary" size={24} />
                                <p className="text-2xl font-bold text-gray-900">{statistics.followersCount}</p>
                                <p className="text-sm text-gray-600">Abonnés</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="container mx-auto px-4 mt-8">
                <div className="bg-white rounded-xl shadow-sm p-2 flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                            activeTab === 'products'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Produits ({products.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                            activeTab === 'about'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        À propos
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                            activeTab === 'reviews'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Avis ({reviews.length})
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="container mx-auto px-4 mt-8">
                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Filter size={18} /> Filtres
                                </h3>
                                
                                {/* Categories */}
                                <div className="space-y-3">
                                    <p className="font-semibold text-sm text-gray-700">Catégories</p>
                                    <div className="space-y-2">
                                        {categories.map((cat) => (
                                            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    checked={selectedCategory === cat}
                                                    onChange={() => setSelectedCategory(cat)}
                                                    className="text-primary focus:ring-primary"
                                                />
                                                <span className="text-gray-600 group-hover:text-primary transition capitalize">
                                                    {cat === 'all' ? 'Toutes' : cat}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="lg:col-span-3">
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                                </h2>
                                <div className="flex items-center gap-4">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="relevance">Trier par : Pertinence</option>
                                        <option value="newest">Plus récents</option>
                                        <option value="price_asc">Prix : Croissant</option>
                                        <option value="price_desc">Prix : Décroissant</option>
                                        <option value="rating">Mieux notés</option>
                                    </select>
                                    <div className="flex gap-1 border border-gray-200 rounded-lg p-1 bg-white">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded transition ${
                                                viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Grid size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded transition ${
                                                viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100'
                                            }`}
                                        >
                                            <ListIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {filteredProducts.length > 0 ? (
                                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6' : 'space-y-4'}>
                                    {filteredProducts.map((product) => (
                                        viewMode === 'grid' ? (
                                            <Link
                                                key={product._id}
                                                to={`/product/${product._id}`}
                                                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                            >
                                                <div className="h-64 bg-gray-100 overflow-hidden relative">
                                                    <img
                                                        src={getImgUrl(product.images[0])}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                    />
                                                    {product.oldPrice && product.oldPrice > product.price && (
                                                        <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">
                                                            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleWishlist({ ...product, id: product._id });
                                                        }}
                                                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition ${
                                                            isInWishlist(product._id)
                                                                ? 'bg-red-50 text-red-500'
                                                                : 'bg-white text-gray-400 hover:text-red-500'
                                                        }`}
                                                    >
                                                        <Heart size={16} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
                                                    </button>
                                                </div>
                                                <div className="p-4">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.category}</p>
                                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-primary font-bold text-lg">
                                                                {(product.finalPrice || product.price).toFixed(2)} TND
                                                            </p>
                                                            {product.oldPrice && product.oldPrice > product.price && (
                                                                <p className="text-xs text-gray-400 line-through">
                                                                    {product.oldPrice.toFixed(2)} TND
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star size={14} className="text-yellow-500 fill-current" />
                                                            <span className="text-sm font-semibold text-gray-700">
                                                                {product.rating || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ) : (
                                            <Link
                                                key={product._id}
                                                to={`/product/${product._id}`}
                                                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group flex gap-4 p-4"
                                            >
                                                <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                                                    <img
                                                        src={getImgUrl(product.images[0])}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition"
                                                    />
                                                    {product.oldPrice && product.oldPrice > product.price && (
                                                        <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">
                                                            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.category}</p>
                                                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary transition">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <p className="text-primary font-bold text-lg">
                                                                {(product.finalPrice || product.price).toFixed(2)} TND
                                                            </p>
                                                            {product.oldPrice && product.oldPrice > product.price && (
                                                                <p className="text-xs text-gray-400 line-through">
                                                                    {product.oldPrice.toFixed(2)} TND
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star size={14} className="text-yellow-500 fill-current" />
                                                            <span className="text-sm font-semibold text-gray-700">
                                                                {product.rating || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleWishlist({ ...product, id: product._id });
                                                    }}
                                                    className={`p-2 h-10 rounded-full shadow-md transition shrink-0 ${
                                                        isInWishlist(product._id)
                                                            ? 'bg-primary/20 text-primary'
                                                            : 'bg-gray-100 text-gray-400 hover:text-primary'
                                                    }`}
                                                >
                                                    <Heart size={18} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
                                                </button>
                                            </Link>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                                    <ShoppingBag className="mx-auto mb-4 text-gray-300" size={64} />
                                    <p className="text-gray-500 text-lg">Aucun produit trouvé dans cette catégorie.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                    <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos de {seller.shopName || seller.name}</h2>
                        
                        <div className="space-y-6">
                            {/* Description */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {seller.shopDescription || "Aucune description disponible pour cette boutique."}
                                </p>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Informations de contact</h3>
                                <div className="space-y-3">
                                    {seller.shopEmail && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Mail className="text-primary" size={20} />
                                            <a href={`mailto:${seller.shopEmail}`} className="hover:text-primary transition">
                                                {seller.shopEmail}
                                            </a>
                                        </div>
                                    )}
                                    {seller.shopPhone && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Phone className="text-primary" size={20} />
                                            <a href={`tel:${seller.shopPhone}`} className="hover:text-primary transition">
                                                {seller.shopPhone}
                                            </a>
                                        </div>
                                    )}
                                    {seller.shopAddress && (
                                        <div className="flex items-start gap-3 text-gray-600">
                                            <MapPinned className="text-primary mt-1" size={20} />
                                            <div>
                                                <p>{seller.shopAddress}</p>
                                                {seller.shopCity && <p>{seller.shopCity}, {seller.location || 'Tunisia'}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Statistics */}
                            {statistics && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Statistiques</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-500 mb-1">Total Produits</p>
                                            <p className="text-2xl font-bold text-gray-900">{statistics.totalProducts}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-500 mb-1">Ventes Totales</p>
                                            <p className="text-2xl font-bold text-gray-900">{statistics.totalSales}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-500 mb-1">Note Moyenne</p>
                                            <p className="text-2xl font-bold text-gray-900">{statistics.avgRating.toFixed(1)}/5</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Avis clients ({reviews.length})
                        </h2>

                        {reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map((review, idx) => (
                                    <div key={idx} className="border-b border-gray-200 pb-6 last:border-0">
                                        {/* Review Header */}
                                        <div className="flex items-start gap-4 mb-3">
                                            <img
                                                src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.name || 'User'}&background=random`}
                                                alt={review.user?.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={
                                                                i < review.rating
                                                                    ? 'text-primary fill-current'
                                                                    : 'text-gray-300'
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                                {review.productName && (
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        Produit: <span className="font-medium">{review.productName}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Review Content */}
                                        <p className="text-gray-700 leading-relaxed">{review.comment || review.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Star className="mx-auto mb-4 text-gray-300" size={64} />
                                <p className="text-gray-500 text-lg">Aucun avis disponible pour ce vendeur.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Contacter le vendeur</h3>
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {seller.shopEmail && (
                                <a
                                    href={`mailto:${seller.shopEmail}`}
                                    className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition"
                                >
                                    <Mail className="text-primary" size={24} />
                                    <div>
                                        <p className="font-semibold text-gray-900">Email</p>
                                        <p className="text-sm text-gray-600">{seller.shopEmail}</p>
                                    </div>
                                </a>
                            )}

                            {seller.shopPhone && (
                                <a
                                    href={`tel:${seller.shopPhone}`}
                                    className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition"
                                >
                                    <Phone className="text-primary" size={24} />
                                    <div>
                                        <p className="font-semibold text-gray-900">Téléphone</p>
                                        <p className="text-sm text-gray-600">{seller.shopPhone}</p>
                                    </div>
                                </a>
                            )}

                            {!seller.shopEmail && !seller.shopPhone && (
                                <p className="text-center text-gray-500 py-4">
                                    Aucune information de contact disponible.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerPage;