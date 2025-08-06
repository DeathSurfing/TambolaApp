import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { GameSession, GameSessionState, CreateSessionRequest } from '@/types';

// Hook to get session state with real-time updates
export function useSessionState(sessionCode: string, interval = 2000) {
  return useQuery({
    queryKey: ['session-state', sessionCode],
    queryFn: () => apiClient.getSessionState(sessionCode),
    enabled: !!sessionCode,
    refetchInterval: interval, // Poll for real-time updates every 2 seconds
    refetchIntervalInBackground: true, // Continue polling when tab is not active
    staleTime: 500, // Consider data stale after 0.5 second
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 3, // Retry failed requests
    retryDelay: 1000, // Wait 1 second between retries
  });
}

// Hook to create a new game session
export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSessionRequest) => apiClient.createSession(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['session-state', data.session_code], data);
    },
  });
}

// Hook to join a session
export function useJoinSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionCode, playerId }: { sessionCode: string; playerId: string }) =>
      apiClient.joinSession(sessionCode, playerId),
    onSuccess: (_, { sessionCode }) => {
      queryClient.invalidateQueries({ queryKey: ['session-state', sessionCode] });
    },
  });
}

// Hook to call next number (admin only)
export function useCallNumber() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionCode: string) => apiClient.callNumber(sessionCode),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['session-state', data.session_code] });
    },
  });
}

// Hook to reset session (admin only)
export function useResetSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionCode, adminPlayerId }: { sessionCode: string; adminPlayerId: string }) =>
      apiClient.resetSession(sessionCode, adminPlayerId),
    onSuccess: (_, { sessionCode }) => {
      queryClient.invalidateQueries({ queryKey: ['session-state', sessionCode] });
      queryClient.invalidateQueries({ queryKey: ['admin-session-info', sessionCode] });
    },
  });
}

// Hook to deactivate/end session (admin only)
export function useDeactivateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionCode, adminPlayerId }: { sessionCode: string; adminPlayerId: string }) =>
      apiClient.deactivateSession(sessionCode, adminPlayerId),
    onSuccess: (_, { sessionCode }) => {
      queryClient.invalidateQueries({ queryKey: ['session-state', sessionCode] });
      queryClient.invalidateQueries({ queryKey: ['admin-session-info', sessionCode] });
    },
  });
}

// Legacy hooks - map to available functionality
export function useStartSession() {
  // In the FastAPI backend, sessions start active, so this is a no-op
  // but we'll provide it for component compatibility
  return {
    mutate: () => {},
    isPending: false,
  };
}

export function usePauseSession() {
  // Pause functionality might not be available in backend, map to deactivate
  return useDeactivateSession();
}

export function useEndSession() {
  return useDeactivateSession();
}

// Legacy hooks for compatibility
export function useSession(sessionId: string) {
  return useSessionState(sessionId);
}

export function useSessionStatus(sessionId: string) {
  return useSessionState(sessionId);
}
