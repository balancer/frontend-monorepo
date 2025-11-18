import { useQuery } from '@apollo/client'
import {
  GetPoolsDocument,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
} from '@repo/lib/shared/services/api/generated/graphql'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { getGqlPoolType } from '../helpers'

export function useCheckForSimilarPools() {
  const { poolCreationForm, isWeightedPool } = usePoolCreationForm()
  const [network, poolType, poolTokens] = poolCreationForm.watch([
    'network',
    'poolType',
    'poolTokens',
  ])

  const { data, loading, error } = useQuery(GetPoolsDocument, {
    variables: {
      orderBy: GqlPoolOrderBy.TotalLiquidity,
      orderDirection: GqlPoolOrderDirection.Desc,
      where: {
        chainIn: [network],
        poolTypeIn: [getGqlPoolType(poolType)],
        tokensIn: poolTokens.map(({ address }) => address!),
        protocolVersionIn: [3],
      },
    },
    skip: !network || !poolType || !poolTokens?.every(token => token.address),
  })

  const similarPools = data?.pools.filter(pool => {
    const sameNumberOfTokens = pool.poolTokens.length === poolTokens.length
    const sameWeights =
      !isWeightedPool ||
      pool.poolTokens.every(
        token =>
          poolTokens.find(poolToken => poolToken.address === token.address)?.weight ===
          (Number(token.weight) * 100).toString()
      )

    return sameNumberOfTokens && sameWeights
  })

  return {
    similarPools,
    isLoadingSimilarPools: loading,
    errorFetchingSimilarPools: error,
  }
}
