import { Protocol, protocolIconPaths } from '@repo/lib/modules/protocols/useProtocols'
import Image, { ImageProps } from 'next/image'

import { SystemProps } from '@chakra-ui/react'

type Props = Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'> & {
  protocol: Protocol
  size?: number
  sx?: SystemProps
}
export function ProtocolIcon({ size = 18, protocol, ...props }: Props) {
  const src = protocolIconPaths[protocol]
  const alt = protocol
  return <Image alt={alt} height={size} src={src} width={size} {...props} />
}
