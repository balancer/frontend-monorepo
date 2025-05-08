import { Image, ImageProps } from '@chakra-ui/react'

type AvatarComponentProps = {
  address: string
  ensImage?: string | null
  size: number
}

export function CustomAvatar({
  address,
  ensImage,
  size,
  alt,
  ...props
}: ImageProps & AvatarComponentProps) {
  const avatarUrl = ensImage ? ensImage : `https://api.dicebear.com/7.x/thumbs/svg?seed=${address}`

  return <Image alt={alt} height={size} src={avatarUrl} width={size} {...props} />
}
