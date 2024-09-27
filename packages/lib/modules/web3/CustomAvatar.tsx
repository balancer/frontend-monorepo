import { Image, ImageProps } from '@chakra-ui/react'
// eslint-disable-next-line max-len
import { AvatarComponentProps } from '@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/AvatarContext'

export const CustomAvatar = ({
  address,
  ensImage,
  size,
  alt,
  ...props
}: ImageProps & AvatarComponentProps) => {
  const avatarUrl = ensImage ? ensImage : `https://api.dicebear.com/7.x/thumbs/svg?seed=${address}`

  return <Image src={avatarUrl} alt={alt} width={size} height={size} {...props} />
}
