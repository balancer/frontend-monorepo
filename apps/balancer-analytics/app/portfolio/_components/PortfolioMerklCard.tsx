'use client'

import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  HStack,
  Heading,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
import { useMerklRewards } from '@analytics/lib/hooks/useMerklRewards'
import { useGaugeRewards } from '@analytics/lib/hooks/useGaugeRewards'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n)

const tokens = (n: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 4,
  }).format(n)

const MERKL_USER_URL_BASE = 'https://app.merkl.xyz/users'
const BALANCER_PORTFOLIO_URL = 'https://balancer.fi/portfolio'

type Row = {
  symbol: string
  source: 'merkl' | 'gauge'
  chainName: string
  unclaimed: number
  unclaimedUsd: number | null
  key: string
}

export function PortfolioMerklCard({ address }: { address: string }) {
  const merkl = useMerklRewards(address)
  const gauge = useGaugeRewards(address)

  const merklRows: Row[] = (merkl.payload?.rewards ?? []).map(r => ({
    symbol: r.symbol,
    source: 'merkl',
    chainName: r.chainName,
    unclaimed: r.unclaimed,
    unclaimedUsd: r.unclaimedUsd,
    key: `merkl-${r.chainId}-${r.tokenAddress}`,
  }))
  const gaugeRows: Row[] = (gauge.payload?.rewards ?? []).map(r => ({
    symbol: r.symbol,
    source: 'gauge',
    // Frontend-v3 calls Balancer chain names with the GqlChain enum name —
    // re-format here so the row reads "Sonic" rather than "SONIC".
    chainName: r.chain.charAt(0) + r.chain.slice(1).toLowerCase(),
    unclaimed: r.unclaimed,
    unclaimedUsd: r.unclaimedUsd,
    key: `gauge-${r.chainId}-${r.tokenAddress}`,
  }))

  // Merge + sort: USD value desc, ties broken by token units desc.
  const allRows: Row[] = [...merklRows, ...gaugeRows].sort((a, b) => {
    const usdDiff = (b.unclaimedUsd ?? 0) - (a.unclaimedUsd ?? 0)
    if (usdDiff !== 0) return usdDiff
    return b.unclaimed - a.unclaimed
  })

  const totalUsd =
    (merkl.payload?.totalUnclaimedUsd ?? 0) + (gauge.payload?.totalUnclaimedUsd ?? 0)
  const hasAny = allRows.length > 0
  const loading = merkl.loading || gauge.loading
  const hasMerkl = merklRows.length > 0
  const hasGauge = gaugeRows.length > 0
  // Stable deep link to the user's Merkl rewards page.
  const merklUserUrl = `${MERKL_USER_URL_BASE}/${address}`

  return (
    <Card h="full" variant="level1">
      <Flex align="center" flexWrap="wrap" gap="xs" justify="space-between" mb="md">
        <Heading size="h6">Incentive Rewards</Heading>
        <Text color="font.secondary" fontSize="xs">
          unclaimed
        </Text>
      </Flex>

      {loading && !hasAny ? (
        <VStack align="stretch" spacing="sm">
          <Skeleton h="40px" />
          <Skeleton h="20px" />
          <Skeleton h="20px" />
        </VStack>
      ) : !hasAny ? (
        <VStack align="flex-start" spacing="sm">
          <Text color="font.secondary" fontSize="sm">
            No unclaimed gauge or Merkl rewards on supported chains.
          </Text>
          <Text color="font.tertiary" fontSize="xs">
            Active campaigns surface here once Merkl finalises a snapshot or a gauge accrues
            claimable balance.
          </Text>
          <HStack pt="xs" spacing="xs">
            <ClaimMerklButton href={merklUserUrl} variant="tertiary" />
            <OpenBalancerButton variant="tertiary" />
          </HStack>
        </VStack>
      ) : (
        <VStack align="stretch" spacing="sm">
          <Box>
            <Text color="font.secondary" fontSize="xs">
              Total unclaimed
            </Text>
            <TotalUnclaimedHeadline rowCount={allRows.length} totalUsd={totalUsd} />
            <SourceBreakdown
              gaugeUsd={gauge.payload?.totalUnclaimedUsd ?? 0}
              hasGauge={hasGauge}
              hasMerkl={hasMerkl}
              merklUsd={merkl.payload?.totalUnclaimedUsd ?? 0}
            />
          </Box>

          <Divider opacity={0.4} />

          <VStack align="stretch" spacing="xs">
            {allRows.slice(0, 6).map(r => (
              <RewardRow key={r.key} row={r} />
            ))}
            {allRows.length > 6 && (
              <Text color="font.tertiary" fontSize="2xs">
                +{allRows.length - 6} more reward tokens
              </Text>
            )}
          </VStack>

          <HStack pt="xs" spacing="xs">
            {hasMerkl && <ClaimMerklButton href={merklUserUrl} variant="primary" />}
            {hasGauge && <OpenBalancerButton variant={hasMerkl ? 'tertiary' : 'primary'} />}
          </HStack>
        </VStack>
      )}
    </Card>
  )
}

function ClaimMerklButton({
  href,
  variant,
}: {
  href: string
  variant: 'primary' | 'tertiary'
}) {
  return (
    <Button
      as={NextLink}
      href={href}
      rel="noopener noreferrer"
      rightIcon={<ArrowUpRight size={12} />}
      size="sm"
      target="_blank"
      variant={variant}
    >
      Claim on Merkl
    </Button>
  )
}

function OpenBalancerButton({ variant }: { variant: 'primary' | 'tertiary' }) {
  return (
    <TooltipWithTouch
      label="Connect your wallet on balancer.fi to claim gauge rewards. Cross-wallet claiming isn't supported by the gauge contracts — only the owner address can submit the claim."
      placement="top"
    >
      <Button
        as={NextLink}
        href={BALANCER_PORTFOLIO_URL}
        rel="noopener noreferrer"
        rightIcon={<ArrowUpRight size={12} />}
        size="sm"
        target="_blank"
        variant={variant}
      >
        Claim on Balancer
      </Button>
    </TooltipWithTouch>
  )
}

function TotalUnclaimedHeadline({
  totalUsd,
  rowCount,
}: {
  totalUsd: number
  rowCount: number
}) {
  // Rewards exist but none of them carry a USD price (api-v3 / Merkl
  // hasn't priced them yet, or freshly-launched tokens). Showing "—" here
  // would contradict the row list below — instead surface the count so
  // the user knows there's *something* to claim.
  if (totalUsd <= 0) {
    return (
      <Text color="font.maxContrast" fontSize="lg" fontWeight="bold" letterSpacing="-0.4px">
        {rowCount} reward {rowCount === 1 ? 'token' : 'tokens'}
        <Text as="span" color="font.secondary" fontSize="xs" fontWeight="normal" ml="xs">
          (value unpriced)
        </Text>
      </Text>
    )
  }
  return (
    <Text color="font.maxContrast" fontSize="2xl" fontWeight="bold" letterSpacing="-0.4px">
      {usd(totalUsd)}
    </Text>
  )
}

function SourceBreakdown({
  merklUsd,
  gaugeUsd,
  hasMerkl,
  hasGauge,
}: {
  merklUsd: number
  gaugeUsd: number
  hasMerkl: boolean
  hasGauge: boolean
}) {
  if (!hasMerkl && !hasGauge) return null
  return (
    <HStack mt="xs" spacing="md">
      {hasGauge && (
        <Text color="font.tertiary" fontSize="2xs">
          Gauges {usd(gaugeUsd)}
        </Text>
      )}
      {hasMerkl && (
        <Text color="font.tertiary" fontSize="2xs">
          Merkl {usd(merklUsd)}
        </Text>
      )}
    </HStack>
  )
}

function RewardRow({ row }: { row: Row }) {
  const usdLabel =
    row.unclaimedUsd != null && row.unclaimedUsd > 0
      ? usd(row.unclaimedUsd)
      : `${tokens(row.unclaimed)} ${row.symbol}`
  const sourceLabel = row.source === 'gauge' ? 'Gauge' : 'Merkl'

  return (
    <Flex align="center" justify="space-between">
      <HStack spacing="xs">
        <Box
          bg="background.level3"
          borderRadius="full"
          color="font.maxContrast"
          fontSize="2xs"
          fontWeight="bold"
          h="20px"
          minW="20px"
          px="xs"
          textAlign="center"
        >
          {row.symbol.slice(0, 4).toUpperCase()}
        </Box>
        <VStack align="flex-start" spacing={0}>
          <Text fontSize="sm" fontWeight="medium">
            {row.symbol}
          </Text>
          <Text color="font.tertiary" fontSize="2xs">
            {sourceLabel} · {row.chainName}
          </Text>
        </VStack>
      </HStack>
      <VStack align="flex-end" spacing={0}>
        <Text fontFamily="mono" fontSize="xs" fontWeight="medium">
          {usdLabel}
        </Text>
        {row.unclaimedUsd != null && row.unclaimedUsd > 0 && (
          <Text color="font.tertiary" fontSize="2xs">
            {tokens(row.unclaimed)} {row.symbol}
          </Text>
        )}
      </VStack>
    </Flex>
  )
}
