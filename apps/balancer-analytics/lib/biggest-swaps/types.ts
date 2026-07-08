import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export type BiggestSwap = {
  id: string
  poolId: string
  timestamp: number
  tx: string
  valueUSD: number
  chain: GqlChain
  tokenInAddress: string
  tokenOutAddress: string
  tokenInAmount: string
  tokenOutAmount: string
  /** Server-resolved token metadata, when available from api-v3's token list. */
  tokenInSymbol?: string
  tokenOutSymbol?: string
  tokenInLogo?: string
  tokenOutLogo?: string
}

export type BiggestSwapsPayload = {
  items: BiggestSwap[]
  generatedAt: number
  windowSeconds: number
}
