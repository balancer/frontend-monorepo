import { getChainId } from '@repo/lib/config/app.config'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'

export function isMainnet(chain: GqlChain | number): boolean {
  return chain === GqlChainValues.Mainnet || chain === getChainId(GqlChainValues.Mainnet)
}

export function isNotMainnet(chain: GqlChain | number): boolean {
  return !isMainnet(chain)
}

export function isChainDeprecated(chain: GqlChain) {
  return ([GqlChainValues.Mode, GqlChainValues.Fraxtal] as GqlChain[]).includes(chain)
}
