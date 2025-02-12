'use client'

import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { defaultDebounceMs, onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { useDebounce } from 'use-debounce'
import { areEmptyAmounts } from '../../LiquidityActionHelpers'
import { AddLiquidityHandler } from '../handlers/AddLiquidity.handler'
import { AddLiquidityParams, addLiquidityKeys } from './add-liquidity-keys'
import { useQuery } from '@tanstack/react-query'
import { usePool } from '../../../PoolProvider'
import { sentryMetaForAddLiquidityHandler } from '@repo/lib/shared/utils/query-errors'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useBlockNumber } from 'wagmi'
import { isInvariantRatioSimulationErrorMessage } from '@repo/lib/shared/utils/error-filters'
import { Address } from 'viem'

export type AddLiquiditySimulationQueryResult = ReturnType<typeof useAddLiquiditySimulationQuery>

type Params = {
  handler: AddLiquidityHandler
  humanAmountsIn: HumanTokenAmountWithAddress[]
  enabled: boolean
  referenceAmountAddress?: Address // only used by Proportional handlers that require a referenceAmount
}

export function useAddLiquiditySimulationQuery({
  handler,
  humanAmountsIn,
  enabled,
  referenceAmountAddress,
}: Params) {
  const { userAddress } = useUserAccount()
  const { pool, chainId } = usePool()
  const { data: blockNumber } = useBlockNumber({ chainId })
  const { slippage } = useUserSettings()
  const debouncedHumanAmountsIn = useDebounce(humanAmountsIn, defaultDebounceMs)[0]

  const params: AddLiquidityParams = {
    handler,
    userAddress,
    slippage,
    pool,
    humanAmountsIn: debouncedHumanAmountsIn,
  }

  const queryKey = addLiquidityKeys.preview(params)

  const queryFn = async () =>
    handler.simulate(debouncedHumanAmountsIn, userAddress, referenceAmountAddress)

  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && !areEmptyAmounts(debouncedHumanAmountsIn),
    gcTime: 0,
    retry(failureCount, error) {
      if (isInvariantRatioSimulationErrorMessage(error?.message)) {
        if (failureCount === 1) console.log('Silenced simulation error: ', { error })
        // Avoid more retries
        return false
      }
      // 2 retries by default
      return failureCount < 2
    },
    meta: sentryMetaForAddLiquidityHandler('Error in add liquidity simulation query', {
      ...params,
      chainId,
      blockNumber,
    }),
    ...onlyExplicitRefetch,
  })
}
