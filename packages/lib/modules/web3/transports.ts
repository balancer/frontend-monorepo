'use client'

import { Chain } from '@rainbow-me/rainbowkit'
import { fallback, http } from 'wagmi'
import { getGqlChain, shouldUseAnvilFork } from '@repo/lib/config/app.config'
import { SupportedChainId } from '@repo/lib/config/config.types'

import { chains, getDefaultRpcUrl, rpcFallbacks, rpcOverrides } from './ChainConfig'
import { defaultAnvilForkRpcUrl } from '@repo/lib/test/utils/wagmi/fork.helpers'

export function getTransports(chain: Chain) {
  const gqlChain = getGqlChain(chain.id as SupportedChainId)
  const overrideRpcUrl = rpcOverrides[gqlChain]
  const fallbackRpcUrl = rpcFallbacks[gqlChain]
  if (shouldUseAnvilFork) return fallback([http(overrideRpcUrl)])
  if (overrideRpcUrl) return fallback([http(overrideRpcUrl), http(fallbackRpcUrl), http()])
  return fallback([http(), http(fallbackRpcUrl)])
}

export const transports = Object.fromEntries(
  chains.map(chain => [chain.id, getTransports(chain)])
) as Record<number, ReturnType<typeof getTransports>>

export function getRpcUrl(chainId: number): string {
  // Use anvil fork for E2E dev tests
  if (shouldUseAnvilFork) return defaultAnvilForkRpcUrl
  const gqlChain = getGqlChain(chainId)
  return rpcOverrides[gqlChain] || rpcFallbacks[gqlChain] || getDefaultRpcUrl(chainId)
}
