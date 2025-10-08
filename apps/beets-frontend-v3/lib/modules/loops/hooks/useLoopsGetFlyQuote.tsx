import { useQuery } from '@tanstack/react-query'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { mins } from '@repo/lib/shared/utils/time'
import { zeroAddress } from 'viem'

const FLY_API_URL = 'https://api.fly.trade/aggregator/quote'

export function useLoopsGetFlyQuote() {
  const queryKey = ['fly-quote'] as const

  const queryFn = async () => getFlyQuota()

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn,
    ...onlyExplicitRefetch,
  })

  return { data, isLoading, error }
}

async function getFlyQuota(): Promise<any> {
  try {
    const params = new URLSearchParams({
      fromTokenAddress: '0x',
      toTokenAddress: zeroAddress,
      amount: 0n.toString(),
      slippage: '0.005',
      fromAddress: zeroAddress,
      toAddress: zeroAddress,
      gasless: 'true',
      enableRFQ: 'false',
    })

    const res = await fetch(`${FLY_API_URL}?${params.toString()}`, {
      next: { revalidate: mins(1).toSecs() },
    })

    const result = await res.json()

    if (result.error) {
      throw new Error('Invalid quote response: ' + JSON.stringify(result))
    }

    return result
  } catch (error) {
    console.error('Unable to fetch quote', error)
    throw error
  }
}
