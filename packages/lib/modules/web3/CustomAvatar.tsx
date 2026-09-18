import { Image, ImageProps } from '@chakra-ui/react'
import { EmojiAvatarProps } from '@rainbow-me/rainbowkit/components'

export function CustomAvatar({
  address,
  ensImage,
  size,
  alt,
  ...props
}: ImageProps & EmojiAvatarProps) {
  const avatarUrl = ensImage ? ensImage : `https://api.dicebear.com/10.x/thumbs/svg?seed=${address}`

  return <Image alt={alt} height={size} src={avatarUrl} width={size} {...props} />
}
