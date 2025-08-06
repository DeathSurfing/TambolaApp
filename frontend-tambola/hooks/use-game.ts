import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useCalledNumbers(sessionId: string) {
  return useQuery({
    queryKey: ['called-numbers', sessionId],
    queryFn: () => apiClient.getCalledNumbers(sessionId),
    enabled: !!sessionId,
    refetchInterval: 2000, // Poll frequently for real-time updates
  });
}

export function useCallNumber() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionCode: string) => apiClient.callNumber(sessionCode),
    onSuccess: (data, variables) => {
      console.log('Call number SUCCESS - Response data:', data);
      console.log('Call number SUCCESS - Session code:', variables);
      
      // Use the sessionCode from the mutation variables
      const sessionCode = variables;
      
      // Immediately update the cache with the new data from NumberCallResponse
      if (data && typeof data === 'object' && 'called_number' in data) {
        console.log('Updating cache with NumberCallResponse:', data);
        
        // Update admin-session-info cache
        queryClient.setQueryData(['admin-session-info', sessionCode], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            current_number: data.called_number,
            called_numbers: data.all_called_numbers || [...(oldData.called_numbers || []), data.called_number]
          };
        });
        
        // Update session-state cache
        queryClient.setQueryData(['session-state', sessionCode], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            current_number: data.called_number,
            called_numbers: data.all_called_numbers || [...(oldData.called_numbers || []), data.called_number]
          };
        });
      }
      
      // Invalidate all related queries to trigger refetch
      queryClient.invalidateQueries({ 
        queryKey: ['session-state', sessionCode] 
      });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'admin-session-info' && query.queryKey[1] === sessionCode
      });
      queryClient.invalidateQueries({ 
        queryKey: ['called-numbers', sessionCode]
      });
      
      // Force immediate refetch with a small delay to ensure backend is updated
      setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: ['session-state', sessionCode] 
        });
        queryClient.refetchQueries({ 
          predicate: (query) => query.queryKey[0] === 'admin-session-info' && query.queryKey[1] === sessionCode
        });
      }, 100);
    },
    onError: (error, variables) => {
      console.error('Call number ERROR:', error);
      console.error('Session code:', variables);
    }
  });
}
