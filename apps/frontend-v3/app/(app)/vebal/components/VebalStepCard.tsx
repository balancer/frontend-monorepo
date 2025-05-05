import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { ParallaxImage } from '@repo/lib/shared/components/marketing/ParallaxImage'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { ImageBorderCard } from '../ImageBorderCard'
import { ReactNode } from 'react'

interface VebalStepCardProps {
  imgName: string
  altText: string
  heading: string
  step?: string
  description: ReactNode
}

export function VebalStepCard({
  imgName,
  altText,
  heading,
  step,
  description,
}: VebalStepCardProps) {
  return (
    <ImageBorderCard display="flex" flexDirection="column" height="100%">
      <Stack alignItems="center" flex="1" gap="sm" textAlign="center">
        <Box maxW={{ base: '200px', md: '100%' }}>
          <FadeInOnView animateOnce={false}>
            <ParallaxImage
              scaleEnd="105%"
              scaleStart="85%"
              transformOrigin="center"
              yEnd="0%"
              yStart="0%"
            >
              <Picture
                altText={altText}
                defaultImgType="png"
                directory="/images/vebal/"
                imgAvif
                imgAvifDark
                imgName={imgName}
                imgPng
              />
            </ParallaxImage>
          </FadeInOnView>
        </Box>
        <Heading
          as="h3"
          bg="background.gold"
          bgClip="text"
          fontSize={{ base: 'lg', md: 'xl' }}
          pb="0.5"
          size="md"
        >
          {step} {heading}
        </Heading>
        <Text color="font.secondary" lineHeight="1.4" pb="ms" px="md" sx={{ textWrap: 'pretty' }}>
          {description}
        </Text>
      </Stack>
    </ImageBorderCard>
  )
}
