'use client'

import { useDebounce } from 'use-debounce'
import { areEmptyAmounts } from '../../LiquidityActionHelpers'
import { AddLiquidityHandler } from '../handlers/AddLiquidity.handler'
import { AddLiquidityParams, addLiquidityKeys } from './add-liquidity-keys'
import { useQuery } from '@tanstack/react-query'
import { usePool } from '../../../PoolProvider'
import { useBlockNumber } from 'wagmi'
import { defaultDebounceMs, onlyExplicitRefetch } from '../../../../../shared/utils/queries'
import { sentryMetaForAddLiquidityHandler } from '../../../../../shared/utils/query-errors'
import { HumanTokenAmountWithAddress } from '../../../../tokens/token.types'
import { useUserSettings } from '../../../../user/settings/UserSettingsProvider'
import { useUserAccount } from '../../../../web3/UserAccountProvider'

type Params = {
  handler: AddLiquidityHandler
  humanAmountsIn: HumanTokenAmountWithAddress[]
  enabled: boolean
}

export function useAddLiquidityPriceImpactQuery({ handler, humanAmountsIn, enabled }: Params) {
  const { pool, chainId } = usePool()
  const { userAddress, isConnected } = useUserAccount()
  const { slippage } = useUserSettings()
  const debouncedHumanAmountsIn = useDebounce(humanAmountsIn, defaultDebounceMs)[0]
  const { data: blockNumber } = useBlockNumber({ chainId })

  const params: AddLiquidityParams = {
    handler,
    userAddress,
    slippage,
    poolId: pool.id,
    poolType: pool.type,
    humanAmountsIn: debouncedHumanAmountsIn,
  }

  const queryKey = addLiquidityKeys.priceImpact(params)

  const queryFn = async () => handler.getPriceImpact(humanAmountsIn)

  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && isConnected && !areEmptyAmounts(debouncedHumanAmountsIn),
    gcTime: 0,
    meta: sentryMetaForAddLiquidityHandler('Error in add liquidity priceImpact query', {
      ...params,
      chainId,
      blockNumber,
    }),
    ...onlyExplicitRefetch,
  })
}
