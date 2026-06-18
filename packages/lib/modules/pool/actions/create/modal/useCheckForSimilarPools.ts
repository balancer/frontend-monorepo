import { useQuery } from '@apollo/client/react'
import { GetPoolsDocument } from '@repo/lib/shared/services/api/generated/graphql'
import {
  GqlPoolOrderByValues,
  GqlPoolOrderDirectionValues,
} from '@repo/lib/shared/services/api/generated/graphql-enums'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { getGqlPoolType, isWeightedPool } from '../helpers'
import { useWatch } from 'react-hook-form'
import { isCowPool } from '../helpers'

export function useCheckForSimilarPools() {
  const { poolCreationForm } = usePoolCreationForm()
  const [network, poolType, poolTokens] = useWatch({
    control: poolCreationForm.control,
    name: ['network', 'poolType', 'poolTokens'],
  })

  const selectedTokenAddresses = poolTokens
    .map(({ address }) => address?.toLowerCase())
    .filter(address => address !== undefined)

  const { data, loading, error } = useQuery(GetPoolsDocument, {
    variables: {
      orderBy: GqlPoolOrderByValues.TotalLiquidity,
      orderDirection: GqlPoolOrderDirectionValues.Desc,
      where: {
        chainIn: [network],
        poolTypeIn: [getGqlPoolType(poolType)],
        tokensIn: selectedTokenAddresses,
        protocolVersionIn: [isCowPool(poolType) ? 1 : 3],
      },
    },
    skip: !network || !poolType || !poolTokens?.every(token => token.address),
  })

  const selectedTokensSet = new Set(selectedTokenAddresses)

  const similarPools = data?.pools.filter(similarPool => {
    const sameNumberOfTokens = similarPool.poolTokens.length === poolTokens.length
    if (!sameNumberOfTokens) return false

    const sameTokens = similarPool.poolTokens.every(({ address }) =>
      selectedTokensSet.has(address.toLowerCase())
    )
    if (!sameTokens) return false

    const sameWeights = similarPool.poolTokens.every(
      token =>
        poolTokens.find(poolToken => poolToken.address === token.address)?.weight ===
        (Number(token.weight) * 100).toString()
    )
    if (isWeightedPool(poolType) && !sameWeights) return false

    return true
  })

  return {
    similarPools,
    isLoadingSimilarPools: loading,
    errorFetchingSimilarPools: error,
  }
}
