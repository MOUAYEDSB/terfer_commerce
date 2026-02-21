import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';

const AdminCreateSellerPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        shopName: '',
        shopDescription: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.shopName) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/sellers/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create seller');
            }

            setSuccess(`Seller "${formData.name}" created successfully with email: ${formData.email}`);
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                shopName: '',
                shopDescription: ''
            });

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/admin/sellers');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-slate-900 min-h-screen">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Create New Seller</h1>

                <div className="bg-slate-800 rounded-lg shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-300">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg flex items-start gap-3">
                            <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-green-300">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information Section */}
                        <div className="border-b border-slate-700 pb-6">
                            <h2 className="text-lg font-semibold text-orange-400 mb-4">Personal Information</h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+213 772 123 456"
                                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="seller@example.com"
                                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1">Minimum 6 characters</p>
                            </div>
                        </div>

                        {/* Shop Information Section */}
                        <div className="border-b border-slate-700 pb-6">
                            <h2 className="text-lg font-semibold text-orange-400 mb-4">Shop Information</h2>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Shop Name *
                                </label>
                                <input
                                    type="text"
                                    name="shopName"
                                    value={formData.shopName}
                                    onChange={handleChange}
                                    placeholder="My Awesome Shop"
                                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Shop Description
                                </label>
                                <textarea
                                    name="shopDescription"
                                    value={formData.shopDescription}
                                    onChange={handleChange}
                                    placeholder="Describe your shop here..."
                                    rows="4"
                                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/sellers')}
                                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Seller'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateSellerPage;
