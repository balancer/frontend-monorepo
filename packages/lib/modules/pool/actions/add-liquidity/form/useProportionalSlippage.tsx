import { useRef, useState } from 'react'
import { Pool } from '../../../pool.types'
import { getDefaultProportionalSlippagePercentage } from '@repo/lib/shared/utils/slippage'

type Props = {
  pool: Pool
  clearAmountsIn: () => void
  wantsProportional: boolean
}
export function useProportionalSlippage({ pool, clearAmountsIn, wantsProportional }: Props) {
  const [proportionalSlippage, setProportionalSlippage] = useState<string>(
    getDefaultProportionalSlippagePercentage(pool)
  )

  const prevProportionalSlippage = useRef(proportionalSlippage)

  /*
    Clear amounts in when proportional slippage changes.
    This is needed to make sure that bufferPercentage is applied correctly (see TokenBalancesProvider)
    when the user maximizes the input of a token n proportional mode
  */
  if (prevProportionalSlippage.current !== proportionalSlippage) {
    if (wantsProportional) {
      clearAmountsIn()
    }
    prevProportionalSlippage.current = proportionalSlippage
  }

  return { proportionalSlippage, setProportionalSlippage }
}
