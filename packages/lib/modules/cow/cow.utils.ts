import { getChainId } from '@repo/lib/config/app.config'
import { Pool } from '../pool/pool.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function buildCowSwapUrlFromPool(pool: Pool): string {
  // All CoW AMM pools have 2 tokens
  const tokenInAddress = pool.poolTokens[0].address
  const tokenOutAddress = pool.poolTokens[1].address

  return buildCowSwapUrl({
    chain: pool.chain,
    tokenInAddress,
    tokenOutAddress,
  })
}

type CowSwapParams = { chain: GqlChain; tokenInAddress: string; tokenOutAddress: string }
export function buildCowSwapUrl({ chain, tokenInAddress, tokenOutAddress }: CowSwapParams): string {
  const cowSwapBaseUrl = 'https://swap.cow.fi/#/'

  const chainId = getChainId(chain)

  return `${cowSwapBaseUrl}${chainId}/swap/${tokenInAddress}/${tokenOutAddress}`
}
