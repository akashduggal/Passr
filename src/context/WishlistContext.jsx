import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WishlistContext = createContext();

const WISHLIST_STORAGE_KEY = '@passr_wishlist';

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const storedWishlist = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        setWishlistItems(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWishlist = async (items) => {
    try {
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save wishlist:', error);
    }
  };

  const addToWishlist = async (product) => {
    if (!product || !product.id) return;
    
    // Check if already exists to avoid duplicates
    if (isInWishlist(product.id)) return;

    const newItems = [...wishlistItems, product];
    setWishlistItems(newItems);
    await saveWishlist(newItems);
  };

  const removeFromWishlist = async (productId) => {
    const newItems = wishlistItems.filter((item) => item.id !== productId);
    setWishlistItems(newItems);
    await saveWishlist(newItems);
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
