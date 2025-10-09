'use client'

import { useQuery } from '@tanstack/react-query'
import { mins } from '@repo/lib/shared/utils/time'
import {
  FlyTransactionApiRequest,
  FlyTransactionApiResponse,
} from '@/app/api/fly/transaction/route'

export function useLoopsGetFlyTransaction(params: FlyTransactionApiRequest) {
  const queryKey = ['fly-transaction', params] as const

  const queryFn = async () => {
    const searchParams = new URLSearchParams(Object.entries(params) as [string, string][])
    const url = `/api/fly/transaction?${searchParams.toString()}`
    const res = await fetch(url)

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to fetch transaction')
    }

    return (await res.json()) as FlyTransactionApiResponse
  }

  const { data, isLoading, error, refetch } = useQuery<FlyTransactionApiResponse>({
    queryKey,
    queryFn,
    enabled: params.quoteId !== '',
    staleTime: mins(1).toMs(),
  })

  console.log('transaction', { data, params })

  return { data, isLoading, error, refetch }
}
