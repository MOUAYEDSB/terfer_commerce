
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { t } = useTranslation();

    // Initialize cart from localStorage if available
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1, options = {}) => {
        let addedNew = false;

        setCartItems(prevItems => {
            // Check if item already exists with same options (colors/sizes)
            const existingItemIndex = prevItems.findIndex(item =>
                item.id === product.id &&
                item.selectedColor === options.selectedColor &&
                item.selectedSize === options.selectedSize
            );

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                const newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + quantity
                };
                return newItems;
            } else {
                // New item
                addedNew = true;
                return [...prevItems, { ...product, quantity, ...options }];
            }
        });

        // Show toast outside of the state update to avoid double rendering issues
        // We can't know for sure if it was new or updated inside the setState callback because of how React batches updates,
        // but for the user message, "Added to cart" is generally fine for both cases, or we can use a generic success message.
        // However, to be precise, we'll just show a generic success message for now, OR we can check cart items before update, but that's race-condition prone.
        // Simple approach: Just say "Added to cart"
        toast.success(t('cart.item_added_success') || 'Ajouté au panier !');
    };

    const removeFromCart = (itemId, options = {}) => {
        setCartItems(prevItems => prevItems.filter(item =>
            !(item.id === itemId &&
                item.selectedColor === options.selectedColor &&
                item.selectedSize === options.selectedSize)
        ));
        toast.success(t('cart.item_removed_success') || 'Article supprimé');
    };

    const updateQuantity = (itemId, newQuantity, options = {}) => {
        if (newQuantity < 1) return;
        setCartItems(prevItems => prevItems.map(item =>
            (item.id === itemId &&
                item.selectedColor === options.selectedColor &&
                item.selectedSize === options.selectedSize)
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
