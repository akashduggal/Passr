import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportService } from '../../services/SupportService';

export const supportKeys = {
  all: ['support'],
  tickets: () => [...supportKeys.all, 'tickets'],
};

export function useMyTickets() {
  return useQuery({
    queryKey: supportKeys.tickets(),
    queryFn: () => supportService.getMyTickets(),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketData) => supportService.createTicket(ticketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
    },
  });
}
