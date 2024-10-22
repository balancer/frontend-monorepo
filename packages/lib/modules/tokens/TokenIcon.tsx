'use client'

import { useMemo, useState } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { createAvatar } from '@dicebear/core'
import { identicon } from '@dicebear/collection'
import { Address } from 'viem'
import { useTokens } from './TokensProvider'
import { Image, ImageProps, Text, Popover, PopoverTrigger, PopoverContent } from '@chakra-ui/react'

type Props = {
  address?: Address | string
  chain?: GqlChain | number
  logoURI?: string | null
  fallbackSrc?: string
  alt: string
  size?: number
  border?: string
}

export function TokenIcon({
  address,
  chain,
  logoURI,
  alt,
  size = 36,
  border,
  ...rest
}: Props & Omit<ImageProps, 'src'>) {
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
    } catch (error) {
      return undefined
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const iconSrc = useMemo(() => getIconSrc(), [logoURI, token])

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <Image
          alt={alt}
          backgroundColor="background.level4"
          border={border}
          borderRadius="100%"
          height={`${size}px`}
          onError={() => !hasError && setHasError(true)}
          src={hasError || !iconSrc ? fallbackSVG.toDataUriSync() : iconSrc}
          width={`${size}px`}
          {...rest}
        />
      </PopoverTrigger>

      <PopoverContent maxW="300px" p="sm" w="auto">
        <Text fontSize="sm" variant="secondary">
          {alt}
        </Text>
      </PopoverContent>
    </Popover>
  )
}
