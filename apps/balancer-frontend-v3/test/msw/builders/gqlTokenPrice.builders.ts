import { GqlTokenPrice } from '@/lib/shared/services/api/generated/graphql'
import { DeepPartial } from '@apollo/client/utilities'

export function aGqlTokenPriceMock(...options: Partial<GqlTokenPrice>[]): GqlTokenPrice {
  const defaultTokenPrice: DeepPartial<GqlTokenPrice> = {
    address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
    price: 1,
  }

  return Object.assign({}, defaultTokenPrice, ...options)
}
