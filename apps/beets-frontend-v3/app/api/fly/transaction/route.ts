import { Address } from 'viem'
import { createFlyGetHandler } from '../shared'

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

export const GET = createFlyGetHandler<FlyTransactionApiResponse>({
  endpoint: FLY_API_URL,
  invalidResponseMessage: 'Invalid transaction response',
  failureResponseMessage: 'Failed to fetch transaction',
  logContext: 'Unable to fetch transaction from Magpie API',
})
