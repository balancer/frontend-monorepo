'use client'

import { VStack } from '@chakra-ui/react'
import { usePool } from '../PoolProvider'
import { usePoolAlerts } from './usePoolAlerts'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { isComposableStablePool } from '../pool.utils'

export function PoolAlerts() {
  const { pool } = usePool()
  const { poolAlerts, dismissAlert } = usePoolAlerts(pool)
  if (poolAlerts.length === 0) return null

  const affectedByV2Exploit = pool.protocolVersion === 2 && isComposableStablePool(pool)
  const v2ExploitWarningText = `
  We're aware of an exploit impacting Balancer V2 pools.

  Our engineering and security teams are investigating with high priority.

  We'll share verified updates and next steps as soon as we have more information.
`

  return (
    <VStack width="full">
      {poolAlerts.map(alert => (
        <BalAlert
          key={alert.identifier}
          onClose={e => {
            e.preventDefault()
            dismissAlert(alert.identifier)
          }}
          {...alert}
        />
      ))}
      {affectedByV2Exploit && <BalAlert content={v2ExploitWarningText} status="warning" />}
    </VStack>
  )
}
