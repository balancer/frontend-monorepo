import { useQuery } from '@tanstack/react-query'

interface PendingReward {
  address: string
  amount: string
}

export function useRelicPendingRewards() {
  const query = useQuery({
    queryKey: ['relicPendingRewards'],
    queryFn: async (): Promise<PendingReward[]> => {
      // Stub - would normally fetch from contract
      return []
    },
  })

  return {
    data: query.data || [],
    refetch: query.refetch,
    isLoading: query.isLoading,
  }
}
