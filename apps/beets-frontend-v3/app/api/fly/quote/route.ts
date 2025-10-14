import { createFlyGetHandler } from '../shared'

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

export const GET = createFlyGetHandler<FlyQuoteApiResponse>({
  endpoint: FLY_API_URL,
  invalidResponseMessage: 'Invalid quote response',
  failureResponseMessage: 'Failed to fetch quote',
  logContext: 'Unable to fetch quote from Magpie API',
})
