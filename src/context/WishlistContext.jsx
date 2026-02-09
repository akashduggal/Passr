import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/WishlistService';
import auth from '../services/firebaseAuth';
import { useWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '../hooks/queries/useWishlistQueries';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return subscriber;
  }, []);

  const { 
    data: wishlistItems = [], 
    isLoading, 
    isRefetching,
    refetch 
  } = useWishlistQuery({ enabled: !!user });

  const addMutation = useAddToWishlistMutation();
  const removeMutation = useRemoveFromWishlistMutation();

  const loadWishlist = async () => {
    return refetch();
  };

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some((item) => item.id === productId);
  }, [wishlistItems]);

  const addToWishlist = async (product) => {
    if (!product || !product.id || !user) return;
    
    // Check if already exists to avoid duplicates
    if (isInWishlist(product.id)) return;

    addMutation.mutate({ listingId: product.id, product });
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    removeMutation.mutate(productId);
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
        isRefetching,
        loadWishlist,
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
