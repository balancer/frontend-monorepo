'use client'

import { useQuery } from '@tanstack/react-query'
import { mins } from '@repo/lib/shared/utils/time'
import { bn } from '@repo/lib/shared/utils/numbers'
import { FlyQuoteApiRequest, FlyQuoteApiResponse } from '@/app/api/fly/quote/route'

export function useLoopsGetFlyQuote(params: FlyQuoteApiRequest) {
  const queryKey = ['fly-quote', params] as const

  const queryFn = async () => {
    const searchParams = new URLSearchParams(Object.entries(params) as [string, string][])
    const url = `/api/fly/quote?${searchParams.toString()}`
    const res = await fetch(url)

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to fetch quote')
    }

    return (await res.json()) as FlyQuoteApiResponse
  }

  const { data, isLoading, error, refetch } = useQuery<FlyQuoteApiResponse>({
    queryKey,
    queryFn,
    enabled: bn(params.sellAmount).gt(0),
    staleTime: mins(1).toMs(),
  })

  return { data, isLoading, error, refetch }
}
