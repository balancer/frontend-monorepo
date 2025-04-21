import { Box, BoxProps, useColorMode } from '@chakra-ui/react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { RadialPattern } from '@repo/lib/shared/components/zen/RadialPattern'

export function ImageBorderCard({ children, ...props }: BoxProps) {
  const { colorMode } = useColorMode()
  // Use image-set for AVIF (preferred) and JPEG fallback
  const borderImage = colorMode === 'dark'
    ? `image-set(url('/images/textures/rock-slate-square-dark.avif') type('image/avif'), url('/images/textures/rock-slate-square-dark.png') type('image/png'))`
    : `image-set(url('/images/textures/rock-slate-square.avif') type('image/avif'), url('/images/textures/rock-slate-square.jpg') type('image/jpg'))`;

  return (
    <Box
      borderRadius="16px"
      overflow="visible"
      p={4}
      position="relative"
      shadow="2xl"
      sx={{
        '::before': {
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          background: borderImage,
          borderRadius: '16px',
          content: '""',
          inset: 0,
          pointerEvents: 'none',
          position: 'absolute',
          zIndex: 0,
        },
      }}
      {...props}
    >
      <Box
        _dark={{ background: 'background.level0' }}
        background="background.level0"
        borderRadius="ms"
        boxShadow="innerXl"
        display="flex"
        flex="1"
        flexDirection="column"
        height="100%"
        position="relative"
        width="100%"
        zIndex={1}
      >
        <Noise
          backgroundColor="background.level0WithOpacity"
          overflow="hidden"
          p="md"
          position="relative"
          shadow="innerXl"
        >
          <RadialPattern
            circleCount={8}
            height={800}
            innerHeight={150}
            innerWidth={150}
            left="calc(50% - 400px)"
            opacity={colorMode === 'dark' ? 0.35 : 0.75}
            position="absolute"
            top="-210px"
            width={800}
          />
          {children}
        </Noise>
      </Box>
    </Box>
  )
}
