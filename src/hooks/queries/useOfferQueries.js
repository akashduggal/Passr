import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offerService } from '../../services/OfferService';

export const offerKeys = {
  all: ['offers'],
  myOffers: () => [...offerKeys.all, 'my-offers'],
  listingOffers: (listingId) => [...offerKeys.all, 'listing', listingId],
  detail: (id) => [...offerKeys.all, 'detail', id],
};

export function useMyOffers() {
  return useQuery({
    queryKey: offerKeys.myOffers(),
    queryFn: () => offerService.getMyOffers(),
  });
}

export function useListingOffers(listingId) {
  return useQuery({
    queryKey: offerKeys.listingOffers(listingId),
    queryFn: () => offerService.getOffersForListing(listingId),
    enabled: !!listingId,
  });
}

export function useOffer(id) {
  return useQuery({
    queryKey: offerKeys.detail(id),
    queryFn: () => offerService.getOfferById(id),
    enabled: !!id,
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId) => offerService.acceptOffer(offerId),
    onSuccess: (_, offerId) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId) => offerService.rejectOffer(offerId),
    onSuccess: (_, offerId) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
}
