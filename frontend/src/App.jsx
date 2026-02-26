
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';

import CartPage from './pages/CartPage';



import SellerPage from './pages/SellerPage';
import ShopPage from './pages/ShopPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrderDetailPage from './pages/OrderDetailPage';
import InvoicePage from './pages/InvoicePage';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import SellerProductsPage from './pages/SellerProductsPage';
import SellerOrdersPage from './pages/SellerOrdersPage';
import SellerAnalyticsPage from './pages/SellerAnalyticsPage';
import SellerSettingsPage from './pages/SellerSettingsPage';
import AddProductPage from './pages/AddProductPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSellersPage from './pages/AdminSellersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminEarningsPage from './pages/AdminEarningsPage';
import AdminCreateSellerPage from './pages/AdminCreateSellerPage';
import AdminCreateCustomerPage from './pages/AdminCreateCustomerPage';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <AuthProvider>
            <WishlistProvider>
                <CartProvider>
                    <Router>
                        <Toaster position="top-center" reverseOrder={false} />
                        <Routes>
                            {/* Admin Routes - Without Navbar/Footer */}
                            <Route path="/admin/*" element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <Routes>
                                        <Route path="dashboard" element={<AdminDashboardPage />} />
                                        <Route path="users" element={<AdminUsersPage />} />
                                        <Route path="users/create-customer" element={<AdminCreateCustomerPage />} />
                                        <Route path="sellers" element={<AdminSellersPage />} />
                                        <Route path="sellers/create" element={<AdminCreateSellerPage />} />
                                        <Route path="products" element={<AdminProductsPage />} />
                                        <Route path="orders" element={<AdminOrdersPage />} />
                                        <Route path="earnings" element={<AdminEarningsPage />} />
                                    </Routes>
                                </ProtectedRoute>
                            } />

                            {/* Seller Routes - Without Navbar/Footer */}
                            <Route path="/seller/*" element={
                                <ProtectedRoute allowedRoles={['seller']}>
                                    <Routes>
                                        <Route path="dashboard" element={<SellerDashboardPage />} />
                                        <Route path="products" element={<SellerProductsPage />} />
                                        <Route path="products/new" element={<AddProductPage />} />
                                        <Route path="orders" element={<SellerOrdersPage />} />
                                        <Route path="analytics" element={<SellerAnalyticsPage />} />
                                        <Route path="settings" element={<SellerSettingsPage />} />
                                    </Routes>
                                </ProtectedRoute>
                            } />

                            {/* Public Routes - With Navbar/Footer */}
                            <Route path="*" element={
                                <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
                                    <Navbar />
                                    <main className="flex-grow">
                                        <Routes>
                                            <Route path="/" element={<HomePage />} />
                                            <Route path="/product/:id" element={<ProductPage />} />
                                            <Route path="/cart" element={<CartPage />} />
                                            <Route path="/checkout" element={<CheckoutPage />} />
                                            <Route path="/profile" element={<ProfilePage />} />
                                            <Route path="/order/:orderId" element={<OrderDetailPage />} />
                                            <Route path="/order/:orderId/invoice" element={<InvoicePage />} />
                                            <Route path="/shop/:id" element={<SellerPage />} />
                                            <Route path="/shop" element={<ShopPage />} />
                                            <Route path="/login" element={<LoginPage />} />
                                            <Route path="/register" element={<RegisterPage />} />
                                            <Route path="/register-seller" element={<RegisterPage />} />
                                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                                            <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
                                        </Routes>
                                    </main>
                                    <Footer />
                                </div>
                            } />
                        </Routes>
                    </Router>
                </CartProvider>
            </WishlistProvider>
        </AuthProvider>
    );
};

export default App;
