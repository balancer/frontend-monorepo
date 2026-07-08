'use client'

import {
  Box,
  Card,
  Flex,
  HStack,
  Heading,
  IconButton,
  Skeleton,
  Tag,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { getBlockExplorerName, getBlockExplorerTxUrl } from '@repo/lib/shared/utils/blockExplorer'
import { ExternalLink } from 'react-feather'
import { useBiggestSwaps, type BiggestSwap } from '@analytics/lib/hooks/useBiggestSwaps'
import { TokenIconLite } from './TokenIconLite'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(n)

const usdFull = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

function shortAddress(addr: string): string {
  if (!addr) return '?'
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
}

function relativeTime(unixSec: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSec
  if (diff < 60) return `${Math.max(diff, 0)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function BiggestSwaps() {
  const { items, loading, error } = useBiggestSwaps()

  return (
    <Card display="flex" flexDirection="column" h="full" variant="level1">
      <Flex align="center" justify="space-between" mb="md">
        <HStack spacing="sm">
          <Heading size="h6">Top swaps · 24h</Heading>
          <Tag colorScheme="orange" size="sm" variant="subtle">
            by USD
          </Tag>
        </HStack>
        <Text color="font.secondary" fontSize="xs">
          refreshes hourly
        </Text>
      </Flex>

      {error ? (
        <Text color="red.300" fontSize="sm">
          Failed to load: {error.message}
        </Text>
      ) : loading && items.length === 0 ? (
        <VStack align="stretch" spacing="xxs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton h="46px" key={i} />
          ))}
        </VStack>
      ) : items.length === 0 ? (
        <Text color="font.secondary" fontSize="sm">
          No swaps recorded in the last 24h.
        </Text>
      ) : (
        <VStack align="stretch" spacing="xxs">
          {items.map((s, i) => (
            <SwapRow index={i + 1} key={s.id} swap={s} />
          ))}
        </VStack>
      )}
    </Card>
  )
}

function SwapRow({ swap, index }: { swap: BiggestSwap; index: number }) {
  const explorerUrl = getBlockExplorerTxUrl(swap.tx, swap.chain)
  const explorerName = getBlockExplorerName(swap.chain)

  return (
    <Box
      _hover={{ bg: 'background.level0' }}
      alignItems="center"
      borderRadius="md"
      display="grid"
      gap="ms"
      gridTemplateColumns="22px 22px minmax(0, 1fr) auto auto"
      px="xs"
      py="xs"
      transition="background 0.15s"
    >
      <Text color="font.secondary" fontSize="xs" fontWeight="medium" textAlign="right">
        {index}
      </Text>

      <NetworkIcon chain={swap.chain} size={5} />

      <VStack align="flex-start" minW={0} spacing="2px">
        <HStack minW={0} spacing="xxs">
          <TokenIconLite
            address={swap.tokenInAddress}
            logo={swap.tokenInLogo}
            symbol={swap.tokenInSymbol}
          />
          <Text color="font.maxContrast" fontSize="sm" fontWeight="medium" noOfLines={1}>
            {swap.tokenInSymbol ?? shortAddress(swap.tokenInAddress)}
          </Text>
          <Text as="span" color="font.secondary" fontSize="sm" px="2px">
            →
          </Text>
          <TokenIconLite
            address={swap.tokenOutAddress}
            logo={swap.tokenOutLogo}
            symbol={swap.tokenOutSymbol}
          />
          <Text color="font.maxContrast" fontSize="sm" fontWeight="medium" noOfLines={1}>
            {swap.tokenOutSymbol ?? shortAddress(swap.tokenOutAddress)}
          </Text>
        </HStack>
        <Text color="font.secondary" fontSize="2xs" noOfLines={1}>
          pool {shortAddress(swap.poolId)} · {relativeTime(swap.timestamp)}
        </Text>
      </VStack>

      <Tooltip label={usdFull(swap.valueUSD)} openDelay={250} placement="top">
        <Text
          color={swap.valueUSD > 1_000_000 ? 'green.400' : 'font.maxContrast'}
          fontSize="sm"
          fontWeight="bold"
        >
          {usd(swap.valueUSD)}
        </Text>
      </Tooltip>

      <Tooltip label={`Open in ${explorerName}`} openDelay={250} placement="top">
        <IconButton
          _hover={{ color: 'font.maxContrast', bg: 'background.level3' }}
          aria-label={`Open transaction on ${explorerName}`}
          as="a"
          color="font.secondary"
          href={explorerUrl}
          icon={<ExternalLink size={14} />}
          rel="noopener noreferrer"
          size="xs"
          target="_blank"
          variant="ghost"
        />
      </Tooltip>
    </Box>
  )
}
