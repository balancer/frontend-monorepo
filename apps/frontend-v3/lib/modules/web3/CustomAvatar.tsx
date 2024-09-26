import { Image, ImageProps } from '@chakra-ui/react'

// can't import from '@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/AvatarContext'
type AvatarComponentProps = {
  address: string
  ensImage?: string | null
  size: number
}

export const CustomAvatar = ({
  address,
  ensImage,
  size,
  alt,
  ...props
}: ImageProps & AvatarComponentProps) => {
  const avatarUrl = ensImage ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${address}`

  return <Image src={avatarUrl} alt={alt} width={size} height={size} {...props} />
}
