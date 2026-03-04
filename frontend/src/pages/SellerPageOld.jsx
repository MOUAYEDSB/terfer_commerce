import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, Filter, Grid, List as ListIcon, Loader2 } from 'lucide-react';
import { getImgUrl } from '../constants/productConstants';

const SellerPage = () => {
    const { id } = useParams();
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                setLoading(true);
                // Fetch seller info
                const sellerRes = await axios.get(`http://localhost:5000/api/users/seller/${id}`);
                setSeller(sellerRes.data);

                // Fetch seller products
                const productsRes = await axios.get(`http://localhost:5000/api/products?seller=${id}`);
                setProducts(productsRes.data.products || []);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching seller data:', error);
                setLoading(false);
            }
        };

        if (id) {
            fetchSellerData();
        }
    }, [id]);

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

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Banner */}
            <div className="h-64 md:h-80 w-full relative">
                <img
                    src={getImgUrl(seller.shopBanner) || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"}
                    alt="Seller Banner"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Seller Info Header */}
            <div className="container mx-auto px-4 -mt-20 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 shrink-0">
                        <img
                            src={seller.shopLogo ? getImgUrl(seller.shopLogo) : `https://ui-avatars.com/api/?name=${seller.shopName || seller.name}&background=random`}
                            alt={seller.shopName || seller.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{seller.shopName || seller.name}</h1>
                        <p className="text-gray-500 mb-4 max-w-2xl">{seller.shopDescription || "Aucune description disponible pour cette boutique."}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <MapPin size={16} className="text-primary" /> {seller.location || "Tunisie"}
                            </span>
                            <span className="flex items-center gap-1">
                                <Star size={16} className="text-yellow-500 fill-current" />
                                <span className="font-bold text-gray-900">{seller.rating || 0}</span> ({seller.reviews || 0} avis)
                            </span>
                        </div>
                    </div>

                    <div>
                        <button className="bg-gray-900 text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition">
                            Contacter le vendeur
                        </button>
                    </div>
                </div>
            </div>

            {/* Seller Content */}
            <div className="container mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="hidden lg:block space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Filter size={18} /> Filtres Boutique
                        </h3>
                        {/* Categories */}
                        <div className="space-y-4">
                            <p className="font-semibold text-sm text-gray-700">Catégories</p>
                            <div className="space-y-2">
                                {['Mode', 'High-Tech', 'Maison', 'Beauté', 'Bijoux', 'Sport'].map((cat) => (
                                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                                        <span className="text-gray-600 group-hover:text-primary transition">{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {products.length} produits de {seller.shopName || seller.name}
                        </h2>
                        <div className="flex items-center gap-4">
                            <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                                <option>Trier par : Pertinence</option>
                                <option>Prix : Croissant</option>
                                <option>Prix : Décroissant</option>
                            </select>
                            <div className="flex gap-1 border border-gray-200 rounded-lg p-1 bg-white">
                                <button className="p-1.5 rounded hover:bg-gray-100 text-primary"><Grid size={18} /></button>
                                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><ListIcon size={18} /></button>
                            </div>
                        </div>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <Link to={`/product/${product._id}`} key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group">
                                    <div className="h-64 bg-gray-100 overflow-hidden relative">
                                        <img src={getImgUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.category}</p>
                                        <h3 className="font-bold text-gray-900 mb-1 truncate hover:text-primary transition">{product.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                                        <p className="text-primary font-bold text-lg">{product.price} TND</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                            <p className="text-gray-500 text-lg">Cette boutique n'a pas encore ajouté de produits.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerPage;
