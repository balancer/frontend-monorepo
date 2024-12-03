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
import { isInvariantRatioPIErrorMessage } from '@repo/lib/shared/utils/error-filters'

type Params = {
  handler: AddLiquidityHandler
  humanAmountsIn: HumanTokenAmountWithAddress[]
  enabled: boolean
}

export function useAddLiquidityPriceImpactQuery({ handler, humanAmountsIn, enabled }: Params) {
  const { pool, chainId } = usePool()
  const { userAddress } = useUserAccount()
  const { slippage } = useUserSettings()
  const debouncedHumanAmountsIn = useDebounce(humanAmountsIn, defaultDebounceMs)[0]
  const { data: blockNumber } = useBlockNumber({ chainId })

  const params: AddLiquidityParams = {
    handler,
    userAddress,
    slippage,
    pool,
    humanAmountsIn: debouncedHumanAmountsIn,
  }

  const queryKey = addLiquidityKeys.priceImpact(params)

  const queryFn = async () => handler.getPriceImpact(humanAmountsIn)

  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && !areEmptyAmounts(debouncedHumanAmountsIn),
    retry(failureCount, error) {
      if (isInvariantRatioPIErrorMessage(error?.message)) {
        if (failureCount === 1) console.log('Silenced PI error: ', { error })
        // Avoid more retries
        return false
      }
      // 3 retries by default
      return failureCount < 3
    },
    gcTime: 0,
    meta: sentryMetaForAddLiquidityHandler('Error in add liquidity priceImpact query', {
      ...params,
      chainId,
      blockNumber,
    }),
    ...onlyExplicitRefetch,
  })
}
