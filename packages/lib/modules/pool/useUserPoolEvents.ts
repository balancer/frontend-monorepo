import { useEffect } from 'react'
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
      poolId: pool.id,
      userAddress,
    },
    {
      skip: !isConnected,
    }
  )

  useEffect(() => {
    startPolling(120000)
    return () => stopPolling()
  }, [])

  const userPoolEvents = userPoolEventsData?.poolEvents || []

  return {
    userPoolEvents,
    isLoadingUserPoolEvents,
    hasPoolEvents: userPoolEvents.length > 0,
  }
}
