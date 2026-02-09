import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../../services/ListingService';

export const listingKeys = {
  all: ['listings'],
  lists: () => [...listingKeys.all, 'list'],
  list: (filters) => [...listingKeys.lists(), { ...filters }],
  details: () => [...listingKeys.all, 'detail'],
  detail: (id) => [...listingKeys.details(), id],
  seller: (sellerId) => [...listingKeys.all, 'seller', sellerId],
};

export function useListing(id) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => listingService.getListingById(id),
    enabled: !!id,
  });
}

export function useSellerListings(sellerId) {
  return useQuery({
    queryKey: listingKeys.seller(sellerId),
    queryFn: () => listingService.getMyListings(sellerId),
    enabled: !!sellerId,
  });
}

export function useListings(params, options = {}) {
  return useInfiniteQuery({
    queryKey: listingKeys.list(params),
    queryFn: async ({ pageParam = 1 }) => {
      return await listingService.getAllListings(
        pageParam,
        params.limit || 10,
        params.category,
        params.sortBy,
        params.searchQuery,
        params.filters
      );
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === (params.limit || 10) ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    ...options,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingData) => listingService.addListing(listingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingData) => listingService.updateListing(listingData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: listingKeys.detail(data.id) });
      }
    },
  });
}
