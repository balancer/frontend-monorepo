import { Protocol, protocolIconPaths } from '@repo/lib/modules/protocols/useProtocols'
import Image, { ImageProps } from 'next/image'

import { SystemStyleObject } from '@chakra-ui/react';

type Props = Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'> & {
  protocol: Protocol
  size?: number
  sx?: SystemStyleObject
}
export function ProtocolIcon({ size = 18, protocol, ...props }: Props) {
  const src = protocolIconPaths[protocol]
  const alt = protocol
  return <Image alt={alt} height={size} src={src} width={size} {...props} />
}
