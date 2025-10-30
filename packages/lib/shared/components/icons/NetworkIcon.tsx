import { Circle, SquareProps } from '@chakra-ui/react'
import { GqlChain } from '../../services/api/generated/graphql'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import Image from 'next/image'

export function NetworkIcon({
  chain,
  size = 12,
  withPadding = true,
  ...rest
}: { chain: GqlChain; withPadding?: boolean } & SquareProps) {
  const { iconPath, shortName } = getNetworkConfig(chain)

  const imageSize = Number(size) * (withPadding ? 2 : 3) + 8

  return (
    <Circle bg="background.level2" position="relative" size={size} {...rest}>
      {shortName && iconPath && (
        <Image
          alt={shortName}
          fill
          sizes={`${imageSize}px`}
          src={iconPath}
          style={{
            objectFit: 'contain',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </Circle>
  )
}
