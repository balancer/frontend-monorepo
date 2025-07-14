'use client'

import { useMemo, useState } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { createAvatar } from '@dicebear/core'
import { identicon } from '@dicebear/collection'
import { Address } from 'viem'
import { useTokens } from './TokensProvider'
import { Text, Popover, PopoverTrigger, PopoverContent } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { SmartCircularImage } from '@repo/lib/shared/components/image/SmartCircularImage'

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
  // TODO: fix this
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasError, setHasError] = useState(false)
  const { getToken } = useTokens()

  const token = useMemo(() => {
    if (address && chain) {
      return getToken(address, chain)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain])

  const fallbackSVG = createAvatar(identicon, {
    seed: address || 'unknown',
    backgroundColor: ['transparent'],
    radius: 50,
    backgroundType: ['solid'],
    scale: 80,
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
      return src
    } catch {
      return undefined
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const iconSrc = useMemo(() => getIconSrc(), [logoURI, token])

  const tokenImage = (
    <SmartCircularImage
      alt={alt}
      border={border}
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
