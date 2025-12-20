import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren, useEffect } from 'react'
import { GetPoolDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'
import { usePoolMigrations } from './PoolMigrationsProvider'
import { getGqlChain } from '@repo/lib/config/app.config'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { Address, zeroAddress } from 'viem'
import { Pool } from '../pool.types'
import { useRemoveLiquidity } from '../actions/remove-liquidity/RemoveLiquidityProvider'
import { useAddLiquidity } from '../actions/add-liquidity/AddLiquidityProvider'
import { useTransactionSteps } from '../../transactions/transaction-steps/useTransactionSteps'

export type UseMigrateLiquidityResponse = ReturnType<typeof useMigrateLiquidityLogic>
export const MigrateLiquidityContext = createContext<UseMigrateLiquidityResponse | null>(null)

function useMigrateLiquidityLogic(protocol: number, chainId: number, poolId: string) {
  const { userAddress } = useUserAccount()

  const { transactionSteps: removeLiquiditySteps, amountsOut } = useRemoveLiquidity()
  const { transactionSteps: addLiquiditySteps, setHumanAmountsIn } = useAddLiquidity()
  const migrationSteps = useTransactionSteps(
    [...removeLiquiditySteps.steps, ...addLiquiditySteps.steps],
    removeLiquiditySteps.isLoading || addLiquiditySteps.isLoading
  )

  const { getMigration } = usePoolMigrations()
  const migration = getMigration(protocol, chainId, poolId)

  const { data: oldPoolData } = useFetchPool(chainId, poolId, userAddress)
  const { data: newPoolData } = useFetchPool(migration?.new.chainId, migration?.new.id, userAddress)

  useEffect(() => {
    setHumanAmountsIn(amountsOut)
  }, [amountsOut])

  return {
    oldPool: oldPoolData?.pool as Pool | undefined,
    newPool: newPoolData?.pool as Pool | undefined,
    migrationSteps,
  }
}

type Props = PropsWithChildren<{
  protocol: number
  chainId: number
  poolId: string
}>

export function MigrateLiquidityProvider({ protocol, chainId, poolId, children }: Props) {
  const hook = useMigrateLiquidityLogic(protocol, chainId, poolId)
  return (
    <MigrateLiquidityContext.Provider value={hook}>{children}</MigrateLiquidityContext.Provider>
  )
}

export const useMigrateLiquidity = (): UseMigrateLiquidityResponse =>
  useMandatoryContext(MigrateLiquidityContext, 'MigrateLiquidity')

export function useFetchPool(
  chainId: number | undefined,
  id: string | undefined,
  userAddress: Address
) {
  return useQuery(GetPoolDocument, {
    variables: {
      id: id || zeroAddress,
      chain: getGqlChain(chainId || 0),
      userAddress: userAddress.toLowerCase(),
    },
    skip: !chainId || !id,
  })
}
