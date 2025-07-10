import { Box, Center, useColorMode, ResponsiveValue, BoxProps } from '@chakra-ui/react'
import { Picture } from './other/Picture'
import { SparkleIconWrapper } from './animations/SparkleIconWrapper'
import { ReactElement } from 'react'

interface StoneIconProps extends BoxProps {
  sparkleSize: number
  icon: ReactElement
  transformBackground?: string
  boxSize?: ResponsiveValue<number | string>
}

export function StoneIcon({
  sparkleSize,
  icon,
  boxSize = { base: 16, lg: 20, xl: 24 },
  transformBackground,
  ...rest
}: StoneIconProps) {
  const { colorMode } = useColorMode()

  return (
    <Box position="relative" rounded="full" shadow="2xl" zIndex={1} {...rest}>
      <Box rounded="full" shadow="md">
        <Box
          alignItems="center"
          color={colorMode === 'dark' ? 'font.light' : 'brown.300'}
          display="flex"
          fontSize="xs"
          fontWeight="normal"
          h={boxSize}
          overflow="hidden"
          rounded="full"
          shadow="innerRockShadowSm"
          w={boxSize}
        >
          <Box
            h={boxSize}
            overflow="hidden"
            position="absolute"
            rounded="full"
            transform={transformBackground}
            w={boxSize}
            zIndex="-1"
          >
            <Picture
              altText="Rock texture"
              defaultImgType="jpg"
              directory="/images/homepage/"
              height={96}
              imgAvif
              imgAvifDark
              imgJpg
              imgJpgDark
              imgName="stone"
              width={96}
            />
          </Box>
          <Center h="full" w="full">
            <SparkleIconWrapper size={sparkleSize}>{icon}</SparkleIconWrapper>
          </Center>
        </Box>
      </Box>
    </Box>
  )
}
