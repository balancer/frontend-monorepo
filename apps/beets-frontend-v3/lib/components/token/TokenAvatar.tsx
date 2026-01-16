import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'

interface TokenAvatarProps {
  address: string
  height?: string
  width?: string
}

export default function TokenAvatar({ address, height }: TokenAvatarProps) {
  return <TokenIcon address={address} alt="" size={parseInt(height || '24')} />
}
