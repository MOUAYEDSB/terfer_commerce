import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Upload, X, Loader2, Package, DollarSign,
    Tag, Palette, Ruler, Percent, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import SellerLayout from '../components/SellerLayout';
import { useAuth } from '../context/AuthContext';
import {
    CATEGORIES_WITH_SUBCATEGORIES,
    PREDEFINED_COLORS,
    PREDEFINED_SIZES,
    getColorHex
} from '../constants/productConstants';

const API_URL = 'http://localhost:5000';

const authFetch = async (path, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'API error');
    }
    return res.json();
};

const AddProductPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        oldPrice: '',
        wholesalePrice: '',
        category: '',
        subcategory: '',
        brand: '',
        stock: ''
    });

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [customColor, setCustomColor] = useState('');
    const [customSize, setCustomSize] = useState('');
    // Stock par variante: clé "color|size" => quantity
    const [variantQuantities, setVariantQuantities] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Reset subcategory when category changes
        if (name === 'category') {
            setFormData(prev => ({ ...prev, subcategory: '' }));
        }
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        if (images.length + files.length > 10) {
            toast.error('Maximum 10 images autorisées');
            return;
        }

        setUploadingImages(true);

        try {
            const uploadPromises = files.map(async (file) => {
                const reader = new FileReader();
                const previewPromise = new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });

                const formData = new FormData();
                formData.append('image', file);

                const result = await authFetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                const preview = await previewPromise;

                return {
                    path: result.filePath,
                    preview: preview
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);

            setImages(prev => [...prev, ...uploadedImages.map(img => img.path)]);
            setImagePreviews(prev => [...prev, ...uploadedImages.map(img => img.preview)]);

            toast.success(`${files.length} image(s) uploadée(s)`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Erreur lors de l\'upload des images');
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Color management
    const toggleColor = (colorName) => {
        if (selectedColors.includes(colorName)) {
            setSelectedColors(selectedColors.filter(c => c !== colorName));
        } else {
            setSelectedColors([...selectedColors, colorName]);
        }
    };

    const addCustomColor = () => {
        if (customColor.trim() && !selectedColors.includes(customColor.trim())) {
            setSelectedColors([...selectedColors, customColor.trim()]);
            setCustomColor('');
        }
    };

    const removeColor = (colorName) => {
        setSelectedColors(selectedColors.filter(c => c !== colorName));
        setVariantQuantities(prev => {
            const next = { ...prev };
            selectedSizes.forEach(sz => delete next[`${colorName}|${sz}`]);
            return next;
        });
    };

    // Size management
    const toggleSize = (size) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter(s => s !== size));
        } else {
            setSelectedSizes([...selectedSizes, size]);
        }
    };

    const addCustomSize = () => {
        if (customSize.trim() && !selectedSizes.includes(customSize.trim())) {
            setSelectedSizes([...selectedSizes, customSize.trim()]);
            setCustomSize('');
        }
    };

    const removeSize = (size) => {
        setSelectedSizes(selectedSizes.filter(s => s !== size));
        setVariantQuantities(prev => {
            const next = { ...prev };
            selectedColors.forEach(cl => delete next[`${cl}|${size}`]);
            return next;
        });
    };

    const variantKey = (color, size) => `${color}|${size}`;
    const setVariantQuantity = (color, size, value) => {
        const v = parseInt(value, 10);
        setVariantQuantities(prev => ({ ...prev, [variantKey(color, size)]: isNaN(v) ? 0 : Math.max(0, v) }));
    };
    const getVariantQuantity = (color, size) => variantQuantities[variantKey(color, size)] ?? 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (images.length === 0) {
                toast.error('Veuillez ajouter au moins une image');
                setLoading(false);
                return;
            }
            const hasVariantsForSubmit = selectedColors.length > 0 && selectedSizes.length > 0;
            if (hasVariantsForSubmit) {
                const totalVariantStock = selectedColors.reduce((sum, color) =>
                    sum + selectedSizes.reduce((s, size) => s + (getVariantQuantity(color, size) || 0), 0), 0);
                if (totalVariantStock === 0) {
                    toast.error('Indiquez au moins une quantité en stock pour une variante (couleur + taille)');
                    setLoading(false);
                    return;
                }
            } else if (!formData.stock || parseInt(formData.stock, 10) < 0) {
                toast.error('Veuillez indiquer la quantité en stock');
                setLoading(false);
                return;
            }

            const hasVariants = selectedColors.length > 0 && selectedSizes.length > 0;
            const variants = hasVariants
                ? selectedColors.flatMap(color =>
                    selectedSizes.map(size => ({
                        color,
                        size,
                        quantity: getVariantQuantity(color, size)
                    }))
                ).filter(v => v.quantity > 0)
                : [];

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
                wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : undefined,
                category: formData.category,
                subcategory: formData.subcategory || undefined,
                brand: formData.brand || undefined,
                stock: hasVariants ? variants.reduce((sum, v) => sum + v.quantity, 0) : parseInt(formData.stock, 10),
                colors: selectedColors.length > 0 ? selectedColors : undefined,
                sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
                variants: variants.length > 0 ? variants : undefined,
                images: images,
                seller: user._id,
                shop: user.shopName || user.name
            };

            await authFetch('/api/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });

            toast.success('Produit ajouté avec succès !');
            navigate('/seller/products');
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error(error.message || 'Erreur lors de l\'ajout du produit');
        } finally {
            setLoading(false);
        }
    };

    const availableSubcategories = formData.category
        ? CATEGORIES_WITH_SUBCATEGORIES[formData.category] || []
        : [];

    return (
        <SellerLayout>
            <div className="p-6 lg:p-10">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate('/seller/products')}
                            className="p-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ajouter un produit</h1>
                            <p className="text-gray-500">Remplissez les informations du produit</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                        <div className="space-y-8">
                            {/* Images Upload Section */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Images du produit <span className="text-red-500">*</span>
                                </label>

                                <div className="mb-4">
                                    <label className="inline-flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-xl cursor-pointer hover:bg-primary/90 transition font-semibold">
                                        <Upload size={20} />
                                        {uploadingImages ? 'Upload en cours...' : 'Sélectionner des images'}
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            disabled={uploadingImages}
                                        />
                                    </label>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Maximum 10 images (JPEG, PNG, GIF, WebP - max 5MB chacune)
                                    </p>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-lg opacity-0 group-hover:opacity-100"
                                                >
                                                    <X size={16} />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded-md font-semibold">
                                                        Principal
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <hr className="border-gray-200" />

                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Informations de base</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nom du produit <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Package size={20} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                                placeholder="Ex: iPhone 15 Pro Max 256GB"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            required
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={5}
                                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                                            placeholder="Décrivez votre produit en détail..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Catégorie <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Tag size={20} className="text-gray-400" />
                                                </div>
                                                <select
                                                    name="category"
                                                    required
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition appearance-none bg-white"
                                                >
                                                    <option value="">Sélectionnez une catégorie</option>
                                                    {Object.keys(CATEGORIES_WITH_SUBCATEGORIES).map((cat) => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Sous-catégorie
                                            </label>
                                            <select
                                                name="subcategory"
                                                value={formData.subcategory}
                                                onChange={handleChange}
                                                disabled={!formData.category}
                                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            >
                                                <option value="">Sélectionnez une sous-catégorie</option>
                                                {availableSubcategories.map((subcat) => (
                                                    <option key={subcat} value={subcat}>{subcat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Marque
                                        </label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                            placeholder="Ex: Apple, Samsung, Nike, etc."
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* Pricing */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Tarification</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Prix actuel (TND) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign size={20} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="price"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Ancien prix (TND)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Percent size={20} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="oldPrice"
                                                min="0"
                                                step="0.01"
                                                value={formData.oldPrice}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Pour afficher la réduction</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Prix de gros (TND)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign size={20} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="wholesalePrice"
                                                min="0"
                                                step="0.01"
                                                value={formData.wholesalePrice}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Pour vente en gros</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* Colors */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Palette size={20} />
                                    Couleurs disponibles
                                </h3>

                                <div className="space-y-4">
                                    {/* Predefined Colors */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-3">Couleurs prédéfinies</p>
                                        <div className="flex flex-wrap gap-3">
                                            {PREDEFINED_COLORS.map((color) => (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => toggleColor(color.name)}
                                                    className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition ${selectedColors.includes(color.name)
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div
                                                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                                                        style={{ backgroundColor: color.hex }}
                                                    />
                                                    <span className="text-sm font-medium">{color.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Color */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Ajouter une couleur personnalisée</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={customColor}
                                                onChange={(e) => setCustomColor(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                                placeholder="Ex: Bleu ciel"
                                            />
                                            <button
                                                type="button"
                                                onClick={addCustomColor}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Selected Colors */}
                                    {selectedColors.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Couleurs sélectionnées ({selectedColors.length})
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedColors.map((colorName) => (
                                                    <div
                                                        key={colorName}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20"
                                                    >
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-gray-300"
                                                            style={{ backgroundColor: getColorHex(colorName) }}
                                                        />
                                                        <span className="text-sm font-medium">{colorName}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeColor(colorName)}
                                                            className="hover:text-red-600 transition"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* Sizes */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Ruler size={20} />
                                    Tailles disponibles
                                </h3>

                                <div className="space-y-4">
                                    {/* Predefined Sizes */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-3">Tailles prédéfinies</p>
                                        <div className="flex flex-wrap gap-2">
                                            {PREDEFINED_SIZES.map((size) => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => toggleSize(size)}
                                                    className={`px-4 py-2 rounded-lg border-2 font-medium transition ${selectedSizes.includes(size)
                                                            ? 'border-primary bg-primary text-white'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Size */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Ajouter une taille personnalisée</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={customSize}
                                                onChange={(e) => setCustomSize(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                                placeholder="Ex: 42.5"
                                            />
                                            <button
                                                type="button"
                                                onClick={addCustomSize}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Selected Sizes */}
                                    {selectedSizes.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Tailles sélectionnées ({selectedSizes.length})
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedSizes.map((size) => (
                                                    <div
                                                        key={size}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 font-medium"
                                                    >
                                                        {size}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSize(size)}
                                                            className="hover:text-red-600 transition"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* Stock : global ou par variante (couleur + taille) */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Stock</h3>
                                {selectedColors.length > 0 && selectedSizes.length > 0 ? (
                                    <>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Indiquez la quantité en stock pour chaque combinaison couleur / taille.
                                        </p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="text-left p-3 text-sm font-semibold text-gray-700 border-b">Couleur / Taille</th>
                                                        {selectedSizes.map(size => (
                                                            <th key={size} className="p-3 text-sm font-semibold text-gray-700 border-b text-center">{size}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedColors.map(color => (
                                                        <tr key={color} className="border-b border-gray-100 hover:bg-gray-50/50">
                                                            <td className="p-3 flex items-center gap-2">
                                                                <div
                                                                    className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"
                                                                    style={{ backgroundColor: getColorHex(color) }}
                                                                />
                                                                <span className="text-sm font-medium">{color}</span>
                                                            </td>
                                                            {selectedSizes.map(size => (
                                                                <td key={size} className="p-2">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={getVariantQuantity(color, size)}
                                                                        onChange={(e) => setVariantQuantity(color, size, e.target.value)}
                                                                        className="w-full max-w-[5rem] mx-auto block px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-primary focus:border-transparent"
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Total : {selectedColors.reduce((sum, color) =>
                                                sum + selectedSizes.reduce((s, size) => s + (getVariantQuantity(color, size) || 0), 0), 0)} en stock
                                        </p>
                                    </>
                                ) : (
                                    <div className="max-w-xs">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Quantité en stock <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Package size={20} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="stock"
                                                required={selectedColors.length === 0 || selectedSizes.length === 0}
                                                min="0"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="mt-8 flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/seller/products')}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploadingImages}
                                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Ajout en cours...
                                    </>
                                ) : (
                                    <>
                                        <Package size={20} />
                                        Ajouter le produit
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
};

export default AddProductPage;
