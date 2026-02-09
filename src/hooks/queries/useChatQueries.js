import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../services/ChatService';

export const chatKeys = {
  all: ['chats'],
  lists: () => [...chatKeys.all, 'list'],
  details: () => [...chatKeys.all, 'detail'],
  detail: (chatId) => [...chatKeys.details(), chatId],
  messages: (chatId) => [...chatKeys.detail(chatId), 'messages'],
};

export function useChats() {
  return useQuery({
    queryKey: chatKeys.lists(),
    queryFn: () => chatService.getChats(),
  });
}

export function useMessages(chatId) {
  return useQuery({
    queryKey: chatKeys.messages(chatId),
    queryFn: () => chatService.getMessages(chatId),
    enabled: !!chatId,
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ otherUserId, listingId, offerId }) => 
      chatService.createOrGetChat(otherUserId, listingId, offerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, text, image, type, schedule }) => 
      chatService.sendMessage(chatId, text, image, type, schedule),
    onSuccess: (newMessage, variables) => {
      const { chatId } = variables;
      
      // Optimistically update or just invalidate?
      // Invalidation is safer, but we can also manually append to the cache for instant feel
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() }); // Update last message in chat list
    },
  });
}
