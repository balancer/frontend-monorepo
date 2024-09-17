'use client'

import { VStack } from '@chakra-ui/react'
import { usePool } from '../PoolProvider'
import { usePoolAlerts } from './usePoolAlerts'
import { BalAlert } from '@/lib/shared/components/alerts/BalAlert'

export function PoolAlerts() {
  const { pool } = usePool()
  const { poolAlerts, setPoolAlerts } = usePoolAlerts(pool)
  if (poolAlerts.length === 0) return null

  return (
    <VStack width="full">
      {poolAlerts.map(alert => (
        <BalAlert
          key={alert.identifier}
          onClose={e => {
            e.preventDefault()
            setPoolAlerts(poolAlerts.filter(a => a.identifier !== alert.identifier))
          }}
          {...alert}
        />
      ))}
    </VStack>
  )
}
