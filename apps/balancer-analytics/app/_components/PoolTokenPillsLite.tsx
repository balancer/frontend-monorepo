'use client'

import { Badge, Box, HStack, Text, Wrap } from '@chakra-ui/react'
import Image from 'next/image'
import { useState } from 'react'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { isStableLike } from '@repo/lib/modules/pool/pool.helpers'

export type PillToken = {
  address: string
  symbol?: string | null
  logoURI?: string | null
  weight?: string | null
}

const ICON = 22

// Mirrors `PoolListTokenPills` in `@repo/lib` (badge shell, weight text, icon
// stack overlap) but renders token icons via a local <Image> fallback so we
// don't need TokensProvider in the analytics app.
//
// Accepts `tokens` + `type` directly so both the explorer's `EnrichedPool`
// row and the pool detail page's `PoolDetail` shape can pass through
// without adapters.
export function PoolTokenPillsLite({
  tokens,
  type,
}: {
  tokens: PillToken[]
  type: string
}) {
  if (isStableLike(type as GqlPoolType)) {
    return <StablePills tokens={tokens} />
  }
  return <WeightedPills tokens={tokens} />
}

function WeightedPills({ tokens }: { tokens: PillToken[] }) {
  const showSymbols = tokens.length < 5
  return (
    <Wrap spacing="xs">
      {tokens.map((t, i) => (
        <Badge
          alignItems="center"
          bg="background.level2"
          border="1px solid"
          borderColor="border.base"
          borderRadius="full"
          display="flex"
          fontWeight="normal"
          h={['28px', '32px']}
          key={`${t.address}-${i}`}
          overflow="hidden"
          position="relative"
          px={['xxs', 'sm']}
          py="xs"
          shadow="sm"
          textTransform="none"
        >
          <HStack gap={['xs', 'sm']}>
            <TokenAvatar token={t} />
            <HStack gap={['xs', '1.5']}>
              {showSymbols && (
                <Text fontWeight="bold" noOfLines={1} size="sm">
                  {t.symbol ?? '–'}
                </Text>
              )}
              <Text color="font.secondary" fontSize="xs">
                {formatWeight(t.weight)}
              </Text>
            </HStack>
          </HStack>
        </Badge>
      ))}
    </Wrap>
  )
}

function StablePills({ tokens }: { tokens: PillToken[] }) {
  const showSymbols = tokens.length < 5
  const z = Array.from({ length: tokens.length }, (_, i) => i + 1).reverse()
  return (
    <HStack spacing={0}>
      {tokens.map((t, i) => (
        <Badge
          alignItems="center"
          bg="background.level2"
          border="1px solid"
          borderColor="border.base"
          borderRadius="full"
          display="flex"
          fontWeight="normal"
          h={['28px', '32px']}
          key={`${t.address}-${i}`}
          ml={i === 0 ? 0 : -10}
          overflow="hidden"
          pl={[i === 0 ? 1 : 12, i === 0 ? 2 : 12]}
          position="relative"
          pr={['xxs', 'sm']}
          py="xs"
          shadow="sm"
          textTransform="none"
          zIndex={z[i]}
        >
          <HStack gap={['xs', '1.5']}>
            <TokenAvatar token={t} />
            {showSymbols && (
              <Text fontWeight="bold" noOfLines={1} size="sm">
                {t.symbol ?? '–'}
              </Text>
            )}
          </HStack>
        </Badge>
      ))}
    </HStack>
  )
}

// Next/Image throws "Failed to construct 'URL'" synchronously (before
// onError can fire) if `src` is non-empty but unparseable — e.g. a token
// metadata blob that stuck a bare symbol into `logoURI`. Guard at parse time.
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

function TokenAvatar({ token }: { token: PillToken }) {
  const [errored, setErrored] = useState(false)
  const fallbackChar = (token.symbol || token.address || '?').slice(0, 1).toUpperCase()
  const showImage = isValidImgSrc(token.logoURI) && !errored

  return (
    <Box
      alignItems="center"
      bg="background.level3"
      borderRadius="full"
      color="font.secondary"
      display="flex"
      flexShrink={0}
      fontSize="2xs"
      fontWeight="bold"
      h={`${ICON}px`}
      justifyContent="center"
      overflow="hidden"
      position="relative"
      w={`${ICON}px`}
    >
      {showImage ? (
        <Image
          alt={token.symbol || token.address}
          fill
          onError={() => setErrored(true)}
          sizes={`${ICON}px`}
          src={token.logoURI as string}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        fallbackChar
      )}
    </Box>
  )
}

function formatWeight(weight: string | null | undefined): string {
  if (!weight) return ''
  const n = Number(weight)
  if (!Number.isFinite(n) || n <= 0) return ''
  return `${(n * 100).toFixed(0)}%`
}
