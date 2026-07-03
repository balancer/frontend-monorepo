'use client'

import {
  Box,
  Card,
  Flex,
  HStack,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { getChainShortName } from '@repo/lib/config/app.config'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import {
  APR_MIN_TVL_USD,
  useDashboardHighlights,
  type PoolLeader,
} from '@analytics/lib/hooks/useDashboardHighlights'
import { usd } from './format'

const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`

// Pool detail route matches PoolExplorer's getPoolHref — analytics-app local
// `/pool/[chain]/[id]`, using api-v3's canonical id (works for V2 long ids).
function poolHref(pool: PoolLeader['pool']): string {
  const slug = chainToSlugMap[pool.chain] ?? 'ethereum'
  return `/pool/${slug}/${pool.id}`
}

function poolLabel(pool: PoolLeader['pool']): string {
  return pool.symbol ?? pool.name ?? pool.address.slice(0, 8)
}

const POOL_ICON_PX = 36
const POOL_ICON_OVERLAP = 14

export function ProtocolHighlights() {
  const { loading, topVolumeChain, topFeePool, topAprPool } = useDashboardHighlights()

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing="md">
      <HighlightCard
        accent="orange.300"
        caption={
          topVolumeChain ? getChainShortName(topVolumeChain.chain) : undefined
        }
        icon={topVolumeChain && <NetworkIcon chain={topVolumeChain.chain} size={9} />}
        isLoading={loading}
        label="Top chain · 24h volume"
        sub={
          topVolumeChain
            ? `${pct(topVolumeChain.share)} of total · ${topVolumeChain.chainCount} chains tracked`
            : 'No 24h volume recorded'
        }
        value={topVolumeChain ? usd(topVolumeChain.volume24h) : '—'}
      />

      <HighlightCard
        accent="green.400"
        caption={topFeePool ? poolLabel(topFeePool.pool) : undefined}
        captionChain={topFeePool?.pool.chain}
        href={topFeePool ? poolHref(topFeePool.pool) : undefined}
        icon={topFeePool && <PoolIconStack tokens={topFeePool.pool.poolTokens} />}
        isLoading={loading}
        label="Most profitable pool · 24h fees"
        sub={
          topFeePool
            ? `TVL ${usd(topFeePool.tvl)} · ${pct(topFeePool.totalApr)} APR`
            : 'No pool fees recorded'
        }
        value={topFeePool ? usd(topFeePool.fees24h) : '—'}
      />

      <HighlightCard
        accent="purple.300"
        caption={topAprPool ? poolLabel(topAprPool.pool) : undefined}
        captionChain={topAprPool?.pool.chain}
        href={topAprPool ? poolHref(topAprPool.pool) : undefined}
        icon={topAprPool && <PoolIconStack tokens={topAprPool.pool.poolTokens} />}
        isLoading={loading}
        label={`Top APR pool · TVL ≥ ${usd(APR_MIN_TVL_USD)}`}
        sub={
          topAprPool
            ? `TVL ${usd(topAprPool.tvl)} · ${usd(topAprPool.fees24h)} fees · 24h`
            : 'No qualifying pool found'
        }
        value={topAprPool ? pct(topAprPool.totalApr, 2) : '—'}
      />
    </SimpleGrid>
  )
}

type CardProps = {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  caption?: string
  /** Chain badge rendered alongside the pool caption (fee/APR cards). */
  captionChain?: PoolLeader['pool']['chain']
  accent: string
  isLoading?: boolean
  href?: string
}

function HighlightCard({
  label,
  value,
  sub,
  icon,
  caption,
  captionChain,
  accent,
  isLoading,
  href,
}: CardProps) {
  const valueNode = href ? (
    <LinkOverlay
      as={NextLink}
      color="font.maxContrast"
      fontSize={{ base: '2xl', md: '3xl' }}
      fontWeight="bold"
      href={href}
      letterSpacing="-0.8px"
      lineHeight="1"
      noOfLines={1}
    >
      {value}
    </LinkOverlay>
  ) : (
    <Text
      color="font.maxContrast"
      fontSize={{ base: '2xl', md: '3xl' }}
      fontWeight="bold"
      letterSpacing="-0.8px"
      lineHeight="1"
      noOfLines={1}
    >
      {value}
    </Text>
  )

  const body = (
    <VStack align="stretch" h="full" justify="space-between" position="relative" spacing="sm">
      <Text
        color="font.secondary"
        fontSize="xs"
        fontWeight="medium"
        letterSpacing="0.4px"
        noOfLines={1}
        textTransform="uppercase"
      >
        {label}
      </Text>

      {isLoading ? (
        <VStack align="center" py="sm" spacing="sm">
          <Skeleton h="36px" rounded="full" w="80px" />
          <Skeleton h="20px" w="50%" />
        </VStack>
      ) : (
        <Flex align="center" gap="md" justify="center" minH="40px" minW={0}>
          {icon}
          {valueNode}
        </Flex>
      )}

      <VStack align="center" minW={0} spacing="2xs">
        {caption && (
          <HStack minW={0} spacing="xs">
            {captionChain && <NetworkIcon chain={captionChain} size={4} />}
            <Text color="font.maxContrast" fontSize="sm" fontWeight="semibold" noOfLines={1}>
              {caption}
            </Text>
          </HStack>
        )}
        <Text color="font.secondary" fontSize="xs" noOfLines={1} textAlign="center">
          {sub}
        </Text>
      </VStack>
    </VStack>
  )

  const Wrapper = href ? LinkBox : Box

  return (
    <Card
      _hover={href ? { borderColor: accent, transform: 'translateY(-1px)' } : undefined}
      borderColor="transparent"
      borderWidth="1px"
      h="full"
      overflow="hidden"
      p={{ base: 'md', md: 'md' }}
      position="relative"
      transition="border-color 0.15s, transform 0.15s"
      variant="level2"
    >
      <Box
        aria-hidden
        backgroundImage="url('/images/textures/slate-square-small-dark.jpg')"
        backgroundPosition="center"
        backgroundSize="cover"
        inset={0}
        opacity={0.35}
        pointerEvents="none"
        position="absolute"
      />
      <Box
        aria-hidden
        bgGradient={`linear(to-r, ${accent}, transparent)`}
        h="2px"
        left={0}
        opacity={0.85}
        position="absolute"
        right={0}
        top={0}
      />
      <Wrapper h="full" position="relative">
        {body}
      </Wrapper>
    </Card>
  )
}

// Overlapping pool-token icon stack. Mirrors PoolTokenPillsLite's stable
// arrangement but without symbol/weight text — the value beside it carries
// the headline, the stack just makes the pool recognizable at a glance.
type PoolToken = PoolLeader['pool']['poolTokens'][number]

function PoolIconStack({ tokens }: { tokens: PoolToken[] }) {
  const shown = tokens.slice(0, 4)
  if (!shown.length) return null
  const z = Array.from({ length: shown.length }, (_, i) => shown.length - i)
  return (
    <HStack flexShrink={0} spacing={0}>
      {shown.map((t, i) => (
        <Box key={`${t.address}-${i}`} ml={i === 0 ? 0 : `-${POOL_ICON_OVERLAP}px`} zIndex={z[i]}>
          <TokenCircle logoURI={t.logoURI} symbol={t.symbol} />
        </Box>
      ))}
    </HStack>
  )
}

function isValidImgSrc(src: string | null | undefined): src is string {
  if (!src) return false
  if (src.startsWith('/')) return true
  try {
    const u = new URL(src)
    return u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'data:'
  } catch {
    return false
  }
}

function TokenCircle({
  logoURI,
  symbol,
}: {
  logoURI?: string | null
  symbol?: string | null
}) {
  const [errored, setErrored] = useState(false)
  const showImage = isValidImgSrc(logoURI) && !errored
  const fallback = (symbol || '?').slice(0, 1).toUpperCase()
  return (
    <Box
      alignItems="center"
      bg="background.level3"
      border="2px solid"
      borderColor="background.level2"
      borderRadius="full"
      color="font.secondary"
      display="flex"
      flexShrink={0}
      fontSize="xs"
      fontWeight="bold"
      h={`${POOL_ICON_PX}px`}
      justifyContent="center"
      overflow="hidden"
      position="relative"
      shadow="sm"
      w={`${POOL_ICON_PX}px`}
    >
      {showImage ? (
        <Image
          alt={symbol || ''}
          fill
          onError={() => setErrored(true)}
          sizes={`${POOL_ICON_PX}px`}
          src={logoURI as string}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        fallback
      )}
    </Box>
  )
}
