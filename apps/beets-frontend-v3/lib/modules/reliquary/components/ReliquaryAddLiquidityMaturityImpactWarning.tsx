import { Box, BoxProps, VStack } from '@chakra-ui/react'
import { formatDuration, intervalToDuration } from 'date-fns'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { AddLiquiditySimulationQueryResult } from '@repo/lib/modules/pool/actions/add-liquidity/queries/useAddLiquiditySimulationQuery'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { BPT_DECIMALS } from '@repo/lib/modules/pool/pool.constants'
import { useReliquaryAddLiquidityMaturityImpact } from '../hooks/useReliquaryAddLiquidityMaturityImpact'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'

type Props = {
  createNew: boolean
  addLiquidityMaturityImpactQuery: ReturnType<typeof useReliquaryAddLiquidityMaturityImpact>
  simulationQuery: AddLiquiditySimulationQueryResult
}

export function ReliquaryAddLiquidityMaturityImpactWarning({
  createNew,
  addLiquidityMaturityImpactQuery,
  simulationQuery,
}: Props) {
  const boxProps: BoxProps = {
    as: 'span',
    color: 'black',
    fontSize: 'sm',
    fontWeight: 'medium',
    sx: { textWrap: 'balance' },
  }

  const addLiquidityMaturityImpact = addLiquidityMaturityImpactQuery.data

  // Calculate duration for maturity impact (pure function, no Date.now())
  // Must be before early returns to satisfy Rules of Hooks
  const maturityDuration = useMemo(() => {
    if (!addLiquidityMaturityImpact) return null
    const duration = intervalToDuration({
      start: 0,
      end: addLiquidityMaturityImpact.addLiquidityMaturityImpactTimeInMilliseconds,
    })
    return formatDuration(duration, { delimiter: ', ' })
  }, [addLiquidityMaturityImpact])

  // Calculate total invest value from simulation
  const bptOut = simulationQuery.data?.bptOut
  const totalInvestValue = bptOut ? bn(formatUnits(bptOut.amount, BPT_DECIMALS)).toNumber() : 0

  // Don't show warning if creating new Relic
  if (createNew) {
    return null
  }

  // Don't show warning if no add liquidity impact data OR no amount being added
  if (!addLiquidityMaturityImpact || totalInvestValue === 0) {
    return null
  }

  // Don't show warning if Relic stays at max level
  if (addLiquidityMaturityImpact.staysMax) {
    return null
  }

  return (
    <BalAlert
      content={
        <VStack align="start" spacing="0">
          <Box {...boxProps}>
            {`Adding ${fNum('token', totalInvestValue)} fBEETS to this Relic will affect its maturity. It will take an additional ${maturityDuration} to reach maximum maturity.`}
          </Box>
          {addLiquidityMaturityImpact.oldLevel !== addLiquidityMaturityImpact.newLevel && (
            <Box {...boxProps}>
              {`Your Relic will change from level ${addLiquidityMaturityImpact.oldLevel + 1} to level ${addLiquidityMaturityImpact.newLevel + 1}.`}
            </Box>
          )}
        </VStack>
      }
      status="warning"
      w="full"
    />
  )
}
