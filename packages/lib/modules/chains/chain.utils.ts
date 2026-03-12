import { getChainId } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function isMainnet(chain: GqlChain | number): boolean {
  return chain === GqlChain.Mainnet || chain === getChainId(GqlChain.Mainnet)
}

export function isNotMainnet(chain: GqlChain | number): boolean {
  return !isMainnet(chain)
}

export function isChainDeprecated(chain: GqlChain) {
  return [GqlChain.Mode, GqlChain.Fraxtal, GqlChain.Zkevm].includes(chain)
}
