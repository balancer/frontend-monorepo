import { useQuery } from '@apollo/client'
import { GetPoolDocument, GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

const VEBAL_UNDERLYING_POOL = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014'

export function useVeBALPool(userAddress: string) {
  const { data, loading } = useQuery(GetPoolDocument, {
    variables: {
      id: VEBAL_UNDERLYING_POOL,
      chain: GqlChain.Mainnet,
      userAddress: userAddress.toLowerCase(),
    },
  })

  const pool = data?.pool

  return { pool, poolIsLoading: loading }
}
