'use client'

import { Text, VStack, Link, HStack, Box } from '@chakra-ui/react'
import { usePool } from '../PoolProvider'
import { usePoolAlerts } from './usePoolAlerts'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { isComposableStablePool } from '../pool.utils'
import { usePoolMigrations } from '../migrations/PoolMigrationsProvider'
import { getChainId, getChainName } from '@repo/lib/config/app.config'
import { MigrationAlert } from '../migrations/MigrationAlert'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { isChainDeprecated } from '../../chains/chain.utils'
import { useStableSurgeMetrics } from '../../hooks/stable-surge/useStableSurgeMetrics'
import { ArrowUpRight } from 'react-feather'
import { isEmpty } from '@repo/lib/shared/utils/array'

export function PoolAlerts() {
  const { pool } = usePool()
  const { poolAlerts, dismissAlert } = usePoolAlerts(pool)
  const { needsMigration } = usePoolMigrations()
  const { surging } = useStableSurgeMetrics(pool)

  const affectedByV2Exploit = pool.protocolVersion === 2 && isComposableStablePool(pool)
  const chainDeprecated = isChainDeprecated(pool.chain)

  if (
    isEmpty(poolAlerts) &&
    !needsMigration &&
    !affectedByV2Exploit &&
    !chainDeprecated &&
    !surging
  ) {
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

      {chainDeprecated && (
        <BalAlert content={<DeprecatedChainWarningContent chain={pool.chain} />} status="warning" />
      )}

      {needsMigration(pool.protocolVersion, getChainId(pool.chain), pool.id) && (
        <MigrationAlert pool={pool} />
      )}

      {surging && <PoolSurgingWarning />}
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

function PoolSurgingWarning() {
  return (
    <BalAlert
      content={
        <Text color="font.dark" position="relative" top="2px">
          This pool with a stable surge hook is surging (flexible adds are disabled).{' '}
          <Link
            alignItems="center"
            color="black"
            display="inline-flex"
            href="https://docs.balancer.fi/concepts/explore-available-balancer-pools/stable-pool/stable-surge-pool.html"
            isExternal
          >
            <Box as="span" textDecoration="underline">
              Learn more
            </Box>
            <Box as="span" ml={0.5}>
              <ArrowUpRight size={12} />
            </Box>
          </Link>
        </Text>
      }
      status="warning"
    />
  )
}
