import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type AuctionFilters, type CreateAuctionPayload, type OpinionVotePayload } from '@/services/api';

// Query hooks
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });
}

export function useAuctions(filters: AuctionFilters = {}) {
  return useQuery({
    queryKey: ['auctions', filters.categoryId, filters.search, filters.page, filters.perPage],
    queryFn: () => api.getAuctions(filters),
  });
}

export function useAuctionById(id: number) {
  return useQuery({
    queryKey: ['auction', id],
    queryFn: () => api.getAuctionById(id),
  });
}

export function useAuctionOpinions(auctionId: number) {
  return useQuery({
    queryKey: ['auction', auctionId, 'opinions'],
    queryFn: () => api.getAuctionOpinions(auctionId),
  });
}

// Mutation hooks
export function useCreateAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAuctionPayload) => api.createAuction(payload),
    onSuccess: () => {
      // Invalidate auctions list to refetch
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
  });
}

export function useCreateOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      auctionId,
      content,
      verdict,
    }: {
      auctionId: number;
      content: string;
      verdict?: 'authentic' | 'fake' | 'unsure';
    }) => api.createOpinion(auctionId, content, verdict),
    onSuccess: (_, variables) => {
      // Invalidate opinions for this auction
      queryClient.invalidateQueries({ queryKey: ['auction', variables.auctionId, 'opinions'] });
    },
  });
}

// Note: Auction voting not available in API
// export function useVoteAuction() {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: ({ auctionId, voteType }: { auctionId: number; voteType: 'authentic' | 'fake' }) =>
//       api.voteAuction(auctionId, voteType),
//     onSuccess: (_, variables) => {
//       // Invalidate auction data and auctions list
//       queryClient.invalidateQueries({ queryKey: ['auction', variables.auctionId] });
//       queryClient.invalidateQueries({ queryKey: ['auctions'] });
//     },
//   });
// }

export function useVoteOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opinionId, payload }: { opinionId: number; payload: OpinionVotePayload; auctionId: number }) =>
      api.voteOpinion(opinionId, payload),
    onSuccess: (_, variables) => {
      // Invalidate opinions for this auction
      queryClient.invalidateQueries({ queryKey: ['auction', variables.auctionId, 'opinions'] });
    },
  });
}
