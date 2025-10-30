import { Circle, SquareProps } from '@chakra-ui/react'
import { GqlChain } from '../../services/api/generated/graphql'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type NetworkConfigProps = {
  iconPath: string
  shortName: string
}

export function NetworkIcon({
  chain,
  size = 12,
  withPadding = true,
  ...rest
}: { chain: GqlChain; withPadding?: boolean } & SquareProps) {
  const [networkConfig, setNetworkConfig] = useState<NetworkConfigProps | undefined>(undefined)
  const { iconPath, shortName } = getNetworkConfig(chain)

  const imageSize = Number(size) * (withPadding ? 2 : 3) + 8

  useEffect(() => {
    if (shortName && iconPath) {
      setNetworkConfig({ iconPath, shortName })
    }
  }, [shortName])

  return (
    <Circle bg="background.level2" size={size} {...rest}>
      {networkConfig && (
        <Image
          alt={networkConfig.shortName}
          height={imageSize}
          src={networkConfig.iconPath}
          style={{ width: 'auto', height: 'auto' }}
          width={imageSize}
        />
      )}
    </Circle>
  )
}
