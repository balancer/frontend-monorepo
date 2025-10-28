import { useQuery } from '@tanstack/react-query'

export function useBatchRelayerHasApprovedForAll() {
  const query = useQuery({
    queryKey: ['batchRelayerApproval'],
    queryFn: async () => {
      // Stub - would normally check approval status
      return false
    },
  })

  return {
    data: query.data,
    refetch: query.refetch,
  }
}
