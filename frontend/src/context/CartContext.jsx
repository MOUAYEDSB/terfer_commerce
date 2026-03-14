
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { t } = useTranslation();

    // Applies when the product has a wholesale price and quantity reaches the threshold.
    const WHOLESALE_QTY_THRESHOLD = 10;

    // Initialize cart from localStorage if available
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const getRetailUnitPrice = (item) => {
        const n = Number(item?.finalPrice ?? item?.displayPrice ?? item?.price ?? 0);
        return Number.isFinite(n) ? n : 0;
    };

    const getWholesaleUnitPrice = (item) => {
        const n = Number(item?.finalWholesalePrice ?? item?.wholesalePrice ?? 0);
        return Number.isFinite(n) ? n : 0;
    };

    const getItemUnitPrice = (item) => {
        const wholesale = getWholesaleUnitPrice(item);
        if (wholesale > 0 && Number(item?.quantity || 0) >= WHOLESALE_QTY_THRESHOLD) return wholesale;
        return getRetailUnitPrice(item);
    };

    const getItemLineTotal = (item) => getItemUnitPrice(item) * Number(item?.quantity || 0);

    const addToCart = (product, quantity = 1, options = {}) => {
        let addedNew = false;

        setCartItems(prevItems => {
            const productId = product?.id || product?._id;
            const retailUnitPrice = Number(product?.finalPrice ?? product?.displayPrice ?? product?.price ?? 0);
            const normalizedProduct = {
                ...product,
                id: productId,
                // Keep a stable Mongo-style id too (many pages use either id or _id)
                _id: product?._id || productId,
                // Ensure `price` is what the customer pays per unit at retail (commission included if backend provides it).
                price: Number.isFinite(retailUnitPrice) ? retailUnitPrice : 0
            };

            // Check if item already exists with same options (colors/sizes)
            const existingItemIndex = prevItems.findIndex(item =>
                item.id === productId &&
                item.selectedColor === options.selectedColor &&
                item.selectedSize === options.selectedSize
            );

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                const newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    ...normalizedProduct,
                    quantity: newItems[existingItemIndex].quantity + quantity
                };
                return newItems;
            } else {
                // New item
                addedNew = true;
                return [...prevItems, { ...normalizedProduct, quantity, ...options }];
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
    const cartTotal = cartItems.reduce((acc, item) => acc + getItemLineTotal(item), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            WHOLESALE_QTY_THRESHOLD,
            getItemUnitPrice,
            getItemLineTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
