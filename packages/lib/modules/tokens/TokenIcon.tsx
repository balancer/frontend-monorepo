/* eslint-disable react-hooks/preserve-manual-memoization */
import { useMemo, useState } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { createAvatar } from '@dicebear/core'
import { identicon } from '@dicebear/collection'
import { Address } from 'viem'
import { useTokens } from './TokensProvider'
import { Text, Popover, PopoverTrigger, PopoverContent } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { SmartCircularImage } from '@repo/lib/shared/components/image/SmartCircularImage'
import { getTokenColor } from '@repo/lib/styles/token-colors'
import { proxyExternalImageUrl } from '../pool/utils/image-proxy'

type Props = {
  address?: Address | string
  chain?: GqlChain | number
  logoURI?: string | null
  fallbackSrc?: string
  alt: string
  size?: number
  border?: string
  weight?: string | null
  disablePopover?: boolean
  overflow?: string
}

export function TokenIcon({
  address,
  chain,
  logoURI,
  alt,
  size = 36,
  border,
  weight,
  disablePopover,
  ...rest
}: Props) {
  const [hasError, setHasError] = useState(false)
  const { getToken } = useTokens()

  const token = address && chain ? getToken(address, chain) : undefined

  const tokenColor =
    chain && address
      ? { rowColor: [getTokenColor(chain, address as Address).from.replace('#', '')] }
      : {}

  const fallbackSVG = createAvatar(identicon, {
    seed: address || 'unknown',
    backgroundColor: ['transparent'],
    radius: 50,
    backgroundType: ['solid'],
    scale: 80,
    ...tokenColor,
  })

  function getIconSrc(): string | undefined {
    let src: string | undefined | null

    if (logoURI) {
      src = logoURI
    } else if (token) {
      src = token.logoURI
    }

    if (!src) return undefined

    try {
      new URL(src)
      // Proxy certain external images to avoid CORS issues
      return proxyExternalImageUrl(src)
    } catch {
      return undefined
    }
  }

  const iconSrc = useMemo(() => getIconSrc(), [logoURI, token])

  const tokenImage = (
    <SmartCircularImage
      alt={alt}
      border={border}
      onError={() => !hasError && setHasError(true)}
      size={size}
      src={hasError || !iconSrc ? fallbackSVG.toDataUri() : iconSrc}
      {...rest}
    />
  )

  if (disablePopover) {
    return tokenImage
  }

  return (
    <Popover trigger="hover">
      <PopoverTrigger>{tokenImage}</PopoverTrigger>
      <PopoverContent maxW="300px" p="sm" w="auto">
        <Text fontSize="sm" variant="secondary">
          {weight ? `${fNum('weight', weight)} ${alt}` : alt}
        </Text>
      </PopoverContent>
    </Popover>
  )
}
