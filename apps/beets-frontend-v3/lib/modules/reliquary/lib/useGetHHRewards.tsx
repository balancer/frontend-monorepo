import { useQuery } from '@tanstack/react-query'

interface HHRewards {
  totalValue: number
}

export function useGetHHRewards() {
  const query = useQuery({
    queryKey: ['hhRewards'],
    queryFn: async (): Promise<HHRewards> => {
      // Stub - would normally fetch from Hidden Hand API
      return { totalValue: 0 }
    },
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
  }
}
