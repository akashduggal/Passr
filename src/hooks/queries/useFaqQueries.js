import { useQuery } from '@tanstack/react-query';
import { faqService } from '../../services/FaqService';

export const faqKeys = {
  all: ['faqs'],
  list: () => [...faqKeys.all, 'list'],
};

export function useFaqs() {
  return useQuery({
    queryKey: faqKeys.list(),
    queryFn: () => faqService.getFaqs(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
