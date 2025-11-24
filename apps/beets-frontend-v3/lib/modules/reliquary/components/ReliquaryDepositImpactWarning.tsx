import { Alert, AlertIcon, Box, SkeletonText } from '@chakra-ui/react'
import { formatDuration, intervalToDuration } from 'date-fns'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { UseQueryResult } from '@tanstack/react-query'
import { ReliquaryDepositImpact } from '../ReliquaryProvider'
import { AddLiquiditySimulationQueryResult } from '@repo/lib/modules/pool/actions/add-liquidity/queries/useAddLiquiditySimulationQuery'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { BPT_DECIMALS } from '@repo/lib/modules/pool/pool.constants'

type Props = {
  createNew: boolean
  depositImpactQuery: UseQueryResult<ReliquaryDepositImpact | null | undefined>
  simulationQuery: AddLiquiditySimulationQueryResult
}

export function ReliquaryDepositImpactWarning({
  createNew,
  depositImpactQuery,
  simulationQuery,
}: Props) {
  const depositImpact = depositImpactQuery.data

  // Calculate duration for maturity impact (pure function, no Date.now())
  // Must be before early returns to satisfy Rules of Hooks
  const maturityDuration = useMemo(() => {
    if (!depositImpact) return null
    const duration = intervalToDuration({
      start: 0,
      end: depositImpact.depositImpactTimeInMilliseconds,
    })
    return formatDuration(duration, { delimiter: ', ' })
  }, [depositImpact])

  // Calculate total invest value from simulation
  const bptOut = simulationQuery.data?.bptOut
  const totalInvestValue = bptOut ? parseFloat(formatUnits(bptOut.amount, BPT_DECIMALS)) : 0

  const isLoading = depositImpactQuery.isLoading || depositImpactQuery.isFetching

  // Don't show warning if creating new relic
  if (createNew) {
    return null
  }

  // Don't show warning if no deposit impact data OR no amount being deposited
  if (!depositImpact || totalInvestValue === 0) {
    return null
  }

  // Don't show warning if relic stays at max level
  if (depositImpact.staysMax) {
    return null
  }

  return (
    <Box mt="4" w="full">
      <Alert status="warning">
        <AlertIcon alignSelf="center" />
        {!isLoading ? (
          <>
            Depositing {fNum('token', totalInvestValue)} fBEETS into this relic will affect its
            maturity. It will take an additional {maturityDuration} to reach maximum maturity.
            {depositImpact.oldLevel !== depositImpact.newLevel && (
              <>
                {' '}
                Your relic will change from level {depositImpact.oldLevel + 1} to level{' '}
                {depositImpact.newLevel + 1}.
              </>
            )}
          </>
        ) : (
          <Box w="full">
            <SkeletonText noOfLines={2} skeletonHeight="2" spacing="2" />
          </Box>
        )}
      </Alert>
    </Box>
  )
}
