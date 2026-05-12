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
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ExternalLink } from 'react-feather'
import { useLiveSwaps, type LiveSwap } from '@analytics/lib/hooks/useLiveSwaps'
import { useTokenSymbols, type TokenSymbolLookup } from '@analytics/lib/hooks/useTokenSymbols'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(n)

const amountFmt = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 3,
})

function shortAddress(addr: string): string {
  if (!addr) return '?'
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
}

function tokenLabel(
  lookup: TokenSymbolLookup,
  chain: GqlChain,
  address: string
): { symbol: string; isFallback: boolean } {
  const entry = lookup(chain, address)
  if (entry?.symbol) return { symbol: entry.symbol, isFallback: false }
  return { symbol: shortAddress(address), isFallback: true }
}

function formatAmount(amount: string): string {
  const n = Number(amount)
  if (!Number.isFinite(n) || n === 0) return '—'
  return amountFmt.format(n)
}

export function LiveSwapTape() {
  const { items, loading } = useLiveSwaps({ limit: 10 })
  const { lookup } = useTokenSymbols()

  return (
    <Card variant="level1">
      <Flex align="center" justify="space-between" mb="md">
        <HStack spacing="sm">
          <Heading size="h6">Live swaps</Heading>
          <Tag colorScheme="green" size="sm" variant="subtle">
            streaming
          </Tag>
        </HStack>
        <Text color="font.secondary" fontSize="xs">
          last 10
        </Text>
      </Flex>
      <VStack align="stretch" spacing="xxs">
        {loading && items.length === 0
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton h="46px" key={i} />)
          : items.map(s => <SwapRow key={s.id} lookup={lookup} swap={s} />)}
      </VStack>
    </Card>
  )
}

function SwapRow({ swap, lookup }: { swap: LiveSwap; lookup: TokenSymbolLookup }) {
  const tIn = tokenLabel(lookup, swap.chain, swap.tokenInAddress)
  const tOut = tokenLabel(lookup, swap.chain, swap.tokenOutAddress)
  const explorerUrl = getBlockExplorerTxUrl(swap.tx, swap.chain)
  const explorerName = getBlockExplorerName(swap.chain)

  return (
    <Box
      _hover={{ bg: 'background.level0' }}
      alignItems="center"
      borderRadius="md"
      display="grid"
      gap="ms"
      gridTemplateColumns="24px minmax(0, 1fr) auto auto"
      px="xs"
      py="xs"
      transition="background 0.15s"
    >
      <NetworkIcon chain={swap.chain} size={5} />

      <VStack align="flex-start" minW={0} spacing="2px">
        <HStack maxW="full" spacing="xs">
          <Tooltip
            label={`${formatAmount(swap.tokenInAmount)} ${tIn.symbol}`}
            openDelay={250}
            placement="top"
          >
            <Text
              color={tIn.isFallback ? 'font.secondary' : 'font.maxContrast'}
              fontSize="sm"
              fontWeight="medium"
              noOfLines={1}
            >
              {formatAmount(swap.tokenInAmount)} {tIn.symbol}
            </Text>
          </Tooltip>
          <Text color="font.secondary" flexShrink={0} fontSize="xs">
            →
          </Text>
          <Tooltip
            label={`${formatAmount(swap.tokenOutAmount)} ${tOut.symbol}`}
            openDelay={250}
            placement="top"
          >
            <Text
              color={tOut.isFallback ? 'font.secondary' : 'font.maxContrast'}
              fontSize="sm"
              fontWeight="medium"
              noOfLines={1}
            >
              {formatAmount(swap.tokenOutAmount)} {tOut.symbol}
            </Text>
          </Tooltip>
        </HStack>
        <Text color="font.secondary" fontSize="2xs" noOfLines={1}>
          pool {shortAddress(swap.poolId)} · {swap.relativeTime} ago
        </Text>
      </VStack>

      <Text
        color={swap.usdValue > 50_000 ? 'green.400' : 'font.maxContrast'}
        fontSize="sm"
        fontWeight="medium"
      >
        {usd(swap.usdValue)}
      </Text>

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
