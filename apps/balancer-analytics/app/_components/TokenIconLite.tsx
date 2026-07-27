'use client'

import { Box, Text, Tooltip } from '@chakra-ui/react'
import { useState } from 'react'

type Props = {
  address: string
  /** Token symbol, used for tooltip label + fallback initial. */
  symbol?: string
  /** Logo URL from api-v3's token list. May be null/undefined for unknown tokens. */
  logo?: string
  size?: number
}

/**
 * Slim token icon for analytics rows. Doesn't depend on `TokensProvider`
 * (which `@repo/lib/modules/tokens/TokenIcon` requires and the analytics app
 * doesn't wire up), so we don't pay for the full token-color / dicebear
 * pipeline. Best-effort: render the logo, fall back to a colored circle
 * with the first symbol char on load failure.
 */
export function TokenIconLite({ address, symbol, logo, size = 18 }: Props) {
  const [errored, setErrored] = useState(false)
  const label = symbol || address.slice(0, 6)
  const initial = (symbol || address.slice(2, 3)).charAt(0).toUpperCase()
  const bg = colorFromAddress(address)
  const showLogo = logo && !errored

  return (
    <Tooltip label={label} openDelay={250} placement="top">
      <Box
        bg={showLogo ? 'background.level3' : bg}
        borderRadius="full"
        boxSize={`${size}px`}
        display="inline-flex"
        flexShrink={0}
        overflow="hidden"
        position="relative"
      >
        {showLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={label}
            onError={() => setErrored(true)}
            src={logo}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Text
            color="white"
            fontSize={`${Math.max(8, Math.floor(size * 0.45))}px`}
            fontWeight="bold"
            lineHeight={`${size}px`}
            textAlign="center"
            w="full"
          >
            {initial}
          </Text>
        )}
      </Box>
    </Tooltip>
  )
}

// 8-color palette derived from the address. Deterministic so the same token
// renders the same color across reloads.
const PALETTE = [
  '#9f95f0',
  '#E6C6A0',
  '#25e2a4',
  '#EA9A43',
  '#56c596',
  '#b3aef5',
  '#5a8dee',
  '#e26b9c',
]

function colorFromAddress(addr: string): string {
  let h = 0
  for (let i = 2; i < Math.min(addr.length, 10); i++) h = (h * 31 + addr.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}
