import { Protocol, protocolIconPaths } from '@repo/lib/modules/protocols/useProtocols'
import Image, { ImageProps } from 'next/image'

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  protocol: Protocol
}
export function ProtocolIcon({ width = 20, height = 20, protocol, ...props }: Props) {
  const src = protocolIconPaths[protocol]
  const alt = protocol
  return <Image alt={alt} height={height} src={src} width={width} {...props} />
}
