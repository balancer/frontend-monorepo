import { formatUnits } from 'viem'
import { BPT_DECIMALS } from '../../../pool.constants'
import { usePool } from '../../../PoolProvider'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { bn, fNum } from '@/lib/shared/utils/numbers'
import { BptRow } from '@/lib/modules/tokens/TokenRow/BptRow'
import { requiresProportionalInput } from '../../LiquidityActionHelpers'

export function ReceiptBptOut({
  actualBptOut,
  isLoading,
}: {
  actualBptOut: string
  isLoading?: boolean
}) {
  const { pool } = usePool()
  const { simulationQuery } = useAddLiquidity()
  const expectedBptOutInt = simulationQuery?.data?.bptOut
  const expectedBptOut = expectedBptOutInt
    ? formatUnits(expectedBptOutInt.amount, BPT_DECIMALS)
    : '0'

  const bptDiff = bn(actualBptOut).minus(expectedBptOut)

  const diffLabel = () => {
    if (!simulationQuery?.data || isLoading) return ''
    if (bptDiff.isZero()) return 'Slippage: 0%'

    const slippage = bptDiff.div(expectedBptOut).times(100).toString()

    return `Slippage: ${fNum('slippage', slippage)}`
  }

  return (
    <BptRow
      label="You got"
      rightLabel={diffLabel()}
      bptAmount={actualBptOut}
      pool={pool}
      isLoading={isLoading}
    />
  )
}

export function QuoteBptOut({ label, isLoading = false }: { label?: string; isLoading?: boolean }) {
  const { simulationQuery } = useAddLiquidity()
  const bptOut = simulationQuery?.data?.bptOut
  const bptOutUnits = bptOut ? formatUnits(bptOut.amount, BPT_DECIMALS) : '0'
  const { pool } = usePool()

  const proportionalRequired = requiresProportionalInput(pool.type)

  const _label = label
    ? label
    : proportionalRequired
    ? 'You will get'
    : 'You will get (if no slippage)'

  return <BptRow label={_label} bptAmount={bptOutUnits} pool={pool} isLoading={isLoading} />
}
