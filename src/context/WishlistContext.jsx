import React, { createContext, useContext, useState, useEffect } from 'react';
import wishlistService from '../services/WishlistService';
import auth from '../services/firebaseAuth';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return subscriber;
  }, []);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlistItems([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const items = await wishlistService.getWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    if (!product || !product.id || !user) return;
    
    // Check if already exists to avoid duplicates
    if (isInWishlist(product.id)) return;

    // Optimistic update
    const newItems = [product, ...wishlistItems];
    setWishlistItems(newItems);

    try {
      await wishlistService.addToWishlist(product.id);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      // Revert on failure
      setWishlistItems(wishlistItems);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;

    // Optimistic update
    const previousItems = [...wishlistItems];
    const newItems = wishlistItems.filter((item) => item.id !== productId);
    setWishlistItems(newItems);

    try {
      await wishlistService.removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      // Revert on failure
      setWishlistItems(previousItems);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
