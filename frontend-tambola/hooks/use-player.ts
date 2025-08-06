import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CreatePlayerRequest, GenerateTicketsRequest, TicketStrike } from '@/types';

// Hook to get player information
export function usePlayer(playerId: string) {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: () => apiClient.getPlayer(playerId),
    enabled: !!playerId,
  });
}

// Hook to get player's tickets
export function usePlayerTickets(playerId: string) {
  return useQuery({
    queryKey: ['player-tickets', playerId],
    queryFn: () => apiClient.getPlayerTickets(playerId),
    enabled: !!playerId,
    refetchInterval: 5000, // Poll for updates
  });
}

// Hook to create a new player
export function useCreatePlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePlayerRequest) => apiClient.createPlayer(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['player', data.player_id], data);
    },
  });
}

// Hook to generate tickets for a player
export function useGenerateTickets() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ playerId, data }: { playerId: string; data: GenerateTicketsRequest }) =>
      apiClient.generateTickets(playerId, data),
    onSuccess: (data, { playerId }) => {
      queryClient.invalidateQueries({ queryKey: ['player-tickets', playerId] });
    },
  });
}

// Hook to strike/unstrike numbers on tickets
export function useStrikeTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TicketStrike) => apiClient.strikeTicket(data),
    onSuccess: (_, variables) => {
      // Find the player_id from the ticket to invalidate the right cache
      queryClient.invalidateQueries({ 
        queryKey: ['player-tickets']
      });
    },
  });
}

// Legacy hooks for compatibility
export function usePlayerTicket(playerId: string) {
  return usePlayerTickets(playerId);
}

export function useStrikeNumber() {
  return useStrikeTicket();
}
