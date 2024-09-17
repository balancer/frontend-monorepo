/* eslint-disable react-hooks/exhaustive-deps */
import { HStack, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useCountdown } from 'usehooks-ts'
import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { useShouldFreezeQuote } from '@/lib/modules/transactions/transaction-steps/useShouldFreezeQuote'
import { NumberText } from '@/lib/shared/components/typography/NumberText'
import { removeLiquidityStepId } from '../useRemoveLiquidityStep'

function useRemoveLiquidityTimeout() {
  // This countdown needs to be nested here and not at a higher level, like in
  // useRemoveLiquidity, because otherwise it causes re-renders of the entire
  // remove-liquidity flow component tree every second.
  const [secondsToRefetch, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: 30,
    intervalMs: 1000,
  })

  const { simulationQuery, priceImpactQuery, previewModalDisclosure } = useRemoveLiquidity()

  // Disable query refetches:
  // if the flow is complete
  // if the remove liquidity transaction is confirming
  const { shouldFreezeQuote } = useShouldFreezeQuote(removeLiquidityStepId)

  // When the countdown timer reaches 0, refetch all remove liquidity queries.
  useEffect(() => {
    const refetchQueries = async () => {
      stopCountdown()
      resetCountdown()
      await Promise.all([simulationQuery.refetch(), priceImpactQuery.refetch()])
      startCountdown()
    }
    if (secondsToRefetch === 0 && !shouldFreezeQuote) refetchQueries()
  }, [secondsToRefetch])

  // If the transaction flow is complete or confirming, stop the countdown timer.
  // Else start the timer.
  useEffect(() => {
    if (shouldFreezeQuote) {
      stopCountdown()
      resetCountdown()
    } else {
      startCountdown()
    }
  }, [shouldFreezeQuote])

  // When the modal is closed the timeout should be stopped and reset.
  useEffect(() => {
    if (!previewModalDisclosure.isOpen) {
      stopCountdown()
      resetCountdown()
    }
  }, [previewModalDisclosure.isOpen])

  return { secondsToRefetch, shouldFreezeQuote }
}

export function RemoveLiquidityTimeout() {
  const { secondsToRefetch, shouldFreezeQuote } = useRemoveLiquidityTimeout()

  return (
    !shouldFreezeQuote && (
      <HStack spacing="xs" fontSize="sm" fontWeight="normal">
        <Text color="grayText">Quote refresh in</Text>
        <HStack spacing="none">
          <NumberText color="grayText" textAlign="right" fontWeight="bold">
            {secondsToRefetch}
          </NumberText>
          <Text color="grayText" fontWeight="bold">
            s
          </Text>
        </HStack>
      </HStack>
    )
  )
}
