'use client'

import { Text, VStack, Link, HStack } from '@chakra-ui/react'
import { usePool } from '../PoolProvider'
import { usePoolAlerts } from './usePoolAlerts'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { isComposableStablePool } from '../pool.utils'
import { usePoolMigrations } from '../migrations/PoolMigrationsProvider'
import { getChainId, getChainName } from '@repo/lib/config/app.config'
import { MigrationAlert } from '../migrations/MigrationAlert'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function PoolAlerts() {
  const { pool } = usePool()
  const { poolAlerts, dismissAlert } = usePoolAlerts(pool)
  const { needsMigration } = usePoolMigrations()

  const affectedByV2Exploit = pool.protocolVersion === 2 && isComposableStablePool(pool)
  const isChainDeprecated = [GqlChain.Mode, GqlChain.Fraxtal, GqlChain.Zkevm].includes(pool.chain)

  if (poolAlerts.length === 0 && !needsMigration && !affectedByV2Exploit && !isChainDeprecated) {
    return null
  }

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

      {affectedByV2Exploit && <BalAlert content={<V2ExploitContentWarning />} status="warning" />}

      {isChainDeprecated && (
        <BalAlert content={<DeprecatedChainWarningContent chain={pool.chain} />} status="warning" />
      )}

      {needsMigration(pool.protocolVersion, getChainId(pool.chain), pool.id) && (
        <MigrationAlert pool={pool} />
      )}
    </VStack>
  )
}

function V2ExploitContentWarning() {
  return (
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
}

function DeprecatedChainWarningContent({ chain }: { chain: GqlChain }) {
  const chainName = getChainName(chain)
  const learnMoreLink =
    chain === GqlChain.Zkevm
      ? 'https://forum.polygon.technology/t/sunsetting-polygon-zkevm-mainnet-beta-in-2026/21020'
      : 'https://forum.balancer.fi/t/bip-906-deprecation-of-polygon-zkevm-fraxtal-and-mode/6951'
  const problem =
    chain === GqlChain.Zkevm
      ? `Polygon has decided to sunset the ${chainName} network`
      : `The ${chainName} network is being sunset on Balancer.`

  return (
    <HStack>
      <Text color="#000" fontWeight="bold">
        {problem}
      </Text>
      <Text color="#000">{`Remove any liquidity you have in ${chainName} pools.`}</Text>
      <Link
        _hover={{
          color: '#555',
        }}
        color="#000"
        fontWeight="bold"
        href={learnMoreLink}
        isExternal
        textDecoration="underline"
      >
        Learn more
      </Link>
    </HStack>
  )
}
