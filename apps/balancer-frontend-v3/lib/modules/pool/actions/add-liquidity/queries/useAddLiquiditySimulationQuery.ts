'use client'

import { useUserSettings } from '@/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { defaultDebounceMs, onlyExplicitRefetch } from '@/lib/shared/utils/queries'
import { useDebounce } from 'use-debounce'
import { areEmptyAmounts } from '../../LiquidityActionHelpers'
import { AddLiquidityHandler } from '../handlers/AddLiquidity.handler'
import { AddLiquidityParams, addLiquidityKeys } from './add-liquidity-keys'
import { useQuery } from '@tanstack/react-query'
import { usePool } from '../../../PoolProvider'
import { sentryMetaForAddLiquidityHandler } from '@/lib/shared/utils/query-errors'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'

export type AddLiquiditySimulationQueryResult = ReturnType<typeof useAddLiquiditySimulationQuery>

type Params = {
  handler: AddLiquidityHandler
  humanAmountsIn: HumanTokenAmountWithAddress[]
  enabled: boolean
}

export function useAddLiquiditySimulationQuery({ handler, humanAmountsIn, enabled }: Params) {
  const { userAddress } = useUserAccount()
  const { pool } = usePool()
  const { slippage } = useUserSettings()
  const debouncedHumanAmountsIn = useDebounce(humanAmountsIn, defaultDebounceMs)[0]

  const params: AddLiquidityParams = {
    handler,
    userAddress,
    slippage,
    poolId: pool.id,
    poolType: pool.type,
    humanAmountsIn: debouncedHumanAmountsIn,
  }

  const queryKey = addLiquidityKeys.preview(params)

  const queryFn = async () => handler.simulate(debouncedHumanAmountsIn)

  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && !areEmptyAmounts(debouncedHumanAmountsIn),
    gcTime: 0,
    meta: sentryMetaForAddLiquidityHandler('Error in add liquidity simulation query', params),
    ...onlyExplicitRefetch,
  })
}
