import { type NextRequest, NextResponse } from 'next/server'
import { mins } from '@repo/lib/shared/utils/time'

const FLY_API_URL = 'https://api.magpiefi.xyz/aggregator/quote'

export type FlyQuoteApiRequest = {
  fromTokenAddress: string
  toTokenAddress: string
  sellAmount: string
  slippage: string
  fromAddress: string
  toAddress: string
  gasless: string
  network: string
}

export type FlyQuoteApiResponse = {
  id: string
  amountOut: string
  targetAddress: string
  fees: Array<{
    type: string
    value: string
  }>
  resourceEstimate: {
    gasLimit: string
  }
  typedData: {
    types: {
      Swap: Array<{
        name: string
        type: string
      }>
    }
    domain: {
      name: string
      version: string
      chainId: string
      verifyingContract: string
    }
    message: {
      router: string
      sender: string
      recipient: string
      fromAsset: string
      toAsset: string
      deadline: string
      amountOutMin: string
      swapFee: string
      amountIn: string
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PRIVATE_MAGPIE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'NEXT_PRIVATE_MAGPIE_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams

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
        { error: 'Invalid quote response', details: result },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Unable to fetch quote from Magpie API:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch quote',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
