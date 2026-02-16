
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
import SellerDashboardPage from './pages/SellerDashboardPage';
import SellerProductsPage from './pages/SellerProductsPage';
import AddProductPage from './pages/AddProductPage';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const App = () => {
    return (
        <AuthProvider>
            <WishlistProvider>
                <CartProvider>
                    <Router>
                        <Toaster position="top-center" reverseOrder={false} />
                        <Routes>
                            {/* Seller/Admin Routes - Without Navbar/Footer */}
                            <Route path="/seller/*" element={
                                <Routes>
                                    <Route path="dashboard" element={<SellerDashboardPage />} />
                                    <Route path="products" element={<SellerProductsPage />} />
                                    <Route path="products/new" element={<AddProductPage />} />
                                    <Route path="orders" element={<SellerDashboardPage />} />
                                    <Route path="analytics" element={<SellerDashboardPage />} />
                                    <Route path="settings" element={<SellerDashboardPage />} />
                                </Routes>
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
