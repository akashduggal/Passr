import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wishlistService from '../../services/WishlistService';

export const wishlistKeys = {
  all: ['wishlist'],
  list: () => [...wishlistKeys.all, 'list'],
};

export function useWishlistQuery(options = {}) {
  return useQuery({
    queryKey: wishlistKeys.list(),
    queryFn: () => wishlistService.getWishlist(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

export function useAddToWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId }) => wishlistService.addToWishlist(listingId),
    onMutate: async ({ listingId, product }) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.list() });
      const previousWishlist = queryClient.getQueryData(wishlistKeys.list());
      
      if (previousWishlist && product) {
        queryClient.setQueryData(wishlistKeys.list(), (old) => [product, ...old]);
      }
      
      return { previousWishlist };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(wishlistKeys.list(), context.previousWishlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list() });
    },
  });
}

export function useRemoveFromWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId) => wishlistService.removeFromWishlist(listingId),
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.list() });
      const previousWishlist = queryClient.getQueryData(wishlistKeys.list());

      if (previousWishlist) {
        queryClient.setQueryData(wishlistKeys.list(), (old) => 
          old.filter(item => item.id !== listingId)
        );
      }
      return { previousWishlist };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(wishlistKeys.list(), context.previousWishlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list() });
    },
  });
}
