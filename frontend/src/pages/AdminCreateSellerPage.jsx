import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { API_URL } from '../constants/api';

const AdminCreateSellerPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
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

        if (!formData.email) {
            setError('Email is required');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                email: formData.email,
                name: formData.name,
                phone: formData.phone,
                shopName: formData.shopName,
                shopDescription: formData.shopDescription
            };

            const response = await fetch(`${API_URL}/api/admin/sellers/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create seller');
            }

            if (data.emailSent) {
                setSuccess(`Invitation sent to ${formData.email}. The seller will receive a generated password and a login link by email.`);
            } else if (data.generatedPassword) {
                const extra = data.emailError ? ` Email error: ${data.emailError}` : '';
                setSuccess(`Seller created, but email was not sent. Temporary password: ${data.generatedPassword} (send it to the seller + use /login).${extra}`);
            } else {
                setSuccess(`Seller created, but email was not sent. Check backend email configuration.`);
            }
            setFormData({
                name: '',
                email: '',
                phone: '',
                shopName: '',
                shopDescription: ''
            });

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
                <h1 className="text-3xl font-bold text-white mb-8">Invite Seller</h1>

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
                        <div className="border-b border-slate-700 pb-6">
                            <h2 className="text-lg font-semibold text-orange-400 mb-4">Seller Information</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+216 12 345 678"
                                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
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

                            <div className="mt-4 p-3 rounded border border-slate-700 bg-slate-900/40 text-sm text-slate-300">
                                A password will be generated automatically and sent to the seller by email with a link to the login page.
                            </div>
                        </div>

                        <div className="border-b border-slate-700 pb-6">
                            <h2 className="text-lg font-semibold text-orange-400 mb-4">Shop Information (Optional)</h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Shop Name
                                </label>
                                <input
                                    type="text"
                                    name="shopName"
                                    value={formData.shopName}
                                    onChange={handleChange}
                                    placeholder="My Awesome Shop"
                                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
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
                                {loading ? 'Sending...' : 'Send Invite'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateSellerPage;
