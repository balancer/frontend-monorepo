/* eslint-disable react-hooks/exhaustive-deps */
import { HStack, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useCountdown } from 'usehooks-ts'
import { useSwap } from '../SwapProvider'
import { NumberText } from '@/lib/shared/components/typography/NumberText'
import { useShouldFreezeQuote } from '../../transactions/transaction-steps/useShouldFreezeQuote'
import { swapStepId } from '../useSwapStep'

function useSwapTimeout() {
  // This countdown needs to be nested here and not at a higher level, like in
  // useAddLiquidity, because otherwise it causes re-renders of the entire
  // add-liquidity flow component tree every second.
  const [secondsToRefetch, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: 30,
    intervalMs: 1000,
  })

  const { simulationQuery, previewModalDisclosure } = useSwap()

  // Disable query refetches:
  // if the flow is complete
  // if the swap transaction is confirming
  const { shouldFreezeQuote } = useShouldFreezeQuote(swapStepId)

  // When the countdown timer reaches 0, refetch all add liquidity queries.
  useEffect(() => {
    const refetchQueries = async () => {
      stopCountdown()
      resetCountdown()
      await simulationQuery.refetch()
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

  // On first render, start the countdown.
  useEffect(() => {
    stopCountdown()
    resetCountdown()
    startCountdown()
  }, [])

  return { secondsToRefetch, shouldFreezeQuote }
}

export function SwapTimeout() {
  const { secondsToRefetch, shouldFreezeQuote } = useSwapTimeout()

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
