'use client'

import { Text, VStack, Link, HStack } from '@chakra-ui/react'
import { usePool } from '../PoolProvider'
import { usePoolAlerts } from './usePoolAlerts'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { isComposableStablePool } from '../pool.utils'
import { usePoolMigrations } from '../migrations/PoolMigrationsProvider'
import { getChainId, isProd } from '@repo/lib/config/app.config'
import { MigrationAlert } from '../migrations/MigrationAlert'

export function PoolAlerts() {
  const { pool } = usePool()
  const { poolAlerts, dismissAlert } = usePoolAlerts(pool)
  const { needsMigration } = usePoolMigrations()
  if (poolAlerts.length === 0) return null

  const affectedByV2Exploit = pool.protocolVersion === 2 && isComposableStablePool(pool)
  const v2ExploitWarningContent = (
    <HStack>
      <Text color="#000">
        This pool was part of an exploit on some v2 Composable Stable pools (v3 pools not affected).
      </Text>
      <Link
        _hover={{
          color: '#555',
        }}
        color="#000"
        fontWeight="bold"
        href="https://x.com/Balancer/status/1990856260988670132"
        isExternal
        textDecoration="underline"
      >
        Read the Post-Mortem
      </Link>
    </HStack>
  )

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

      {affectedByV2Exploit && <BalAlert content={v2ExploitWarningContent} status="warning" />}

      {!isProd && needsMigration(pool.protocolVersion, getChainId(pool.chain), pool.id) && (
        <MigrationAlert pool={pool} />
      )}
    </VStack>
  )
}
