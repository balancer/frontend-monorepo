import { useEffect, useMemo } from 'react'
import { usePoolEvents } from './usePoolEvents'
import { usePool } from './PoolProvider'
import { useUserAccount } from '../web3/UserAccountProvider'

export function useUserPoolEvents() {
  const { pool, chain } = usePool()
  const { userAddress, isConnected } = useUserAccount()

  const {
    data: userPoolEventsData,
    loading: isLoadingUserPoolEvents,
    startPolling,
    stopPolling,
  } = usePoolEvents(
    {
      chainIn: [chain],
      poolIdIn: [pool.id],
      userAddress,
    },
    {
      skip: !isConnected,
    }
  )

  useEffect(() => {
    startPolling(120000)
    return () => stopPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const userPoolEvents = userPoolEventsData?.poolEvents

  const hasPoolEvents = useMemo(() => {
    return userPoolEvents && userPoolEvents.length > 0
  }, [userPoolEvents])

  return {
    userPoolEvents,
    isLoadingUserPoolEvents,
    hasPoolEvents,
  }
}
