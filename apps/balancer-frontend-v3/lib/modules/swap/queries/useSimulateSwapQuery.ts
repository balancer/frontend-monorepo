'use client'

import { defaultDebounceMs, onlyExplicitRefetch } from '@/lib/shared/utils/queries'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { SwapHandler } from '../handlers/Swap.handler'
import { swapQueryKeys } from './swapQueryKeys'
import { SimulateSwapInputs, SimulateSwapResponse } from '../swap.types'
import { sentryMetaForSwapHandler } from '@/lib/shared/utils/query-errors'
import { isZero } from '@/lib/shared/utils/numbers'

export type SwapSimulationQueryResult = ReturnType<typeof useSimulateSwapQuery>

export type SimulateSwapParams = {
  handler: SwapHandler
  swapInputs: SimulateSwapInputs
  enabled: boolean
}

export function useSimulateSwapQuery({
  handler,
  swapInputs: { swapAmount, chain, tokenIn, tokenOut, swapType },
  enabled = true,
}: SimulateSwapParams) {
  const debouncedSwapAmount = useDebounce(swapAmount, defaultDebounceMs)[0]

  const inputs = {
    swapAmount: debouncedSwapAmount,
    swapType,
    tokenIn,
    tokenOut,
    chain,
  }

  const queryKey = swapQueryKeys.simulation(inputs)

  const queryFn = async () => handler.simulate(inputs)

  return useQuery<SimulateSwapResponse, Error>({
    queryKey,
    queryFn,
    enabled: enabled && !isZero(debouncedSwapAmount),
    gcTime: 0,
    meta: sentryMetaForSwapHandler('Error in swap simulation query', {
      handler,
      swapInputs: inputs,
      enabled,
    }),
    ...onlyExplicitRefetch,
  })
}
