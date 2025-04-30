import { PropsWithChildren } from 'react'
import { Card, CardProps, Box } from '@chakra-ui/react'
import { Picture } from '@repo/lib/shared/components/other/Picture'

export function VotingDeadlineContainer({
  children,
  ...stackProps
}: PropsWithChildren & CardProps) {
  return (
    <Card
      bg="transparent"
      p={{ base: 'ms', xl: '20px' }}
      position="relative"
      rounded="md"
      shadow="xl"
      {...stackProps}
    >
      <Box inset={0} overflow="hidden" position="absolute" rounded="sm" zIndex={0}>
        <Picture
          altText="Background texture"
          defaultImgType="png"
          directory="/images/textures/"
          height="100%"
          imgAvif
          imgAvifDark
          imgAvifPortrait
          imgAvifPortraitDark
          imgName="rock-slate"
          imgPng
          imgPngDark
          width="100%"
        />
      </Box>
      <Box
        bg="background.level1"
        inset={0}
        opacity={0.7}
        pointerEvents="none"
        position="absolute"
        zIndex={1}
      />
      <Box position="relative" zIndex={2}>
        {children}
      </Box>
    </Card>
  )
}
