import { useQuery } from '@apollo/client'
import { GetPoolsDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { getGqlPoolType } from '../helpers'

export function useCheckForSimilarPools() {
  const { poolCreationForm } = usePoolCreationForm()
  const { network, poolType, poolTokens } = poolCreationForm.watch()
  const {
    data: similarPools,
    loading: isLoadingSimilarPools,
    error: errorFetchingSimilarPools,
  } = useQuery(GetPoolsDocument, {
    variables: {
      where: {
        chainIn: [network],
        poolTypeIn: [getGqlPoolType(poolType)],
        tokensIn: poolTokens.map(({ address }) => `"${address}"`),
        protocolVersionIn: [3],
      },
    },
  })

  return { similarPools, isLoadingSimilarPools, errorFetchingSimilarPools }
}
