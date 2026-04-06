
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const getProductId = (product) => product?.id || product?._id;

    const normalizeProduct = (product) => {
        const id = getProductId(product);
        return {
            ...product,
            id,
            _id: product?._id || id
        };
    };

    const addToWishlist = (product) => {
        const normalized = normalizeProduct(product);
        if (!normalized.id) return;
        setWishlistItems(prev => {
            if (prev.find(item => item.id === normalized.id)) {
                return prev;
            }
            toast.success('Ajouté aux favoris ❤️');
            return [...prev, normalized];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems(prev => prev.filter(item => item.id !== productId && item._id !== productId));
        toast.success('Retiré des favoris');
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId || item._id === productId);
    };

    const toggleWishlist = (product) => {
        const id = getProductId(product);
        if (!id) return;
        if (isInWishlist(id)) {
            removeFromWishlist(id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
