/* eslint-disable react-hooks/exhaustive-deps */
import { useCountdown } from 'usehooks-ts'

const DEFAULT_REFETCH_SECONDS_COUNTDOWN = 5 // TODO: increase after feature manual tests

type Props = {
  countdownSeconds?: number
}
export function useRefetchCountdown({
  countdownSeconds = DEFAULT_REFETCH_SECONDS_COUNTDOWN,
}: Props = {}) {
  const [count, { startCountdown, resetCountdown, stopCountdown }] = useCountdown({
    countStart: countdownSeconds,
    intervalMs: 1000,
  })

  const startRefetchCountdown = () => {
    resetCountdown()
    startCountdown()
  }

  const stopRefetchCountdown = () => {
    resetCountdown()
    stopCountdown()
  }

  return {
    secondsToRefetch: count,
    startRefetchCountdown,
    stopRefetchCountdown,
  }
}
