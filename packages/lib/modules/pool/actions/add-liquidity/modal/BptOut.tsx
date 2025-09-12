import { formatUnits } from 'viem'
import { BPT_DECIMALS } from '../../../pool.constants'
import { usePool } from '../../../PoolProvider'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { BptRow } from '@repo/lib/modules/tokens/TokenRow/BptRow'
import { FLEXIBLE_ADD_DESCRIPTION, SlippageOptions, SlippageSelector } from '../../SlippageSelector'
import { Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'

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
      bptAmount={actualBptOut}
      isLoading={isLoading}
      label="You got"
      pool={pool}
      rightElement={
        <Text color="grayText" fontSize="sm">
          {diffLabel()}
        </Text>
      }
    />
  )
}

export function QuoteBptOut({ label, isLoading = false }: { label?: string; isLoading?: boolean }) {
  const { simulationQuery, wantsProportional } = useAddLiquidity()
  const { slippage } = useUserSettings()
  const bptOut = simulationQuery?.data?.bptOut
  const bptOutUnits = bptOut ? formatUnits(bptOut.amount, BPT_DECIMALS) : '0'
  const { pool } = usePool()

  const [selectedSlippage, setSelectedSlippage] = useState(0)
  const bptOutWithSlippage = bn(bptOutUnits)
    .times(1 - selectedSlippage)
    .toString()

  const _label = label ? label : wantsProportional ? 'You will get (exactly)' : 'You will get'

  const calculateSlippage = (value: SlippageOptions) => {
    if (value === 'zero') setSelectedSlippage(0)
    else if (value === 'max') setSelectedSlippage(Number(slippage) / 100)
  }

  return (
    <BptRow
      bptAmount={bptOutWithSlippage}
      isLoading={isLoading}
      label={_label}
      pool={pool}
      rightElement={
        !wantsProportional && (
          <SlippageSelector
            description={FLEXIBLE_ADD_DESCRIPTION}
            onChange={calculateSlippage}
            selectedIndex={0}
            title="Slippage on 'flexible' adds"
          />
        )
      }
    />
  )
}
