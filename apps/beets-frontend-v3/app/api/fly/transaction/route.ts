import { type NextRequest, NextResponse } from 'next/server'
import { Address } from 'viem'
import { mins } from '@repo/lib/shared/utils/time'

const FLY_API_URL = 'https://api.magpiefi.xyz/aggregator/transaction'

export type FlyTransactionApiRequest = {
  quoteId: string | undefined
  estimateGas: string
}

export type FlyTransactionApiResponse = {
  from: Address
  to: Address
  data: `0x${string}`
  chainId: number
  type: number
  gasLimit: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  value: string
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PRIVATE_MAGPIE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'MAGPIE_API_KEY is not configured' }, { status: 500 })
    }

    const searchParams = request.nextUrl.searchParams

    console.log({ url: `${FLY_API_URL}?${searchParams.toString()}` })

    const res = await fetch(`${FLY_API_URL}?${searchParams.toString()}`, {
      headers: {
        apikey: apiKey,
      },
      next: { revalidate: mins(1).toSecs() },
    })

    if (!res.ok) {
      throw new Error(`Magpie API returned ${res.status}: ${res.statusText}`)
    }

    const result = await res.json()

    if (result.error) {
      return NextResponse.json(
        { error: 'Invalid transaction response', details: result },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Unable to fetch transaction from Magpie API:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
