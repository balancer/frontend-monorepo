import { Box, Text } from '@chakra-ui/react'
import { Picture } from './Picture'

interface StatProps {
  label: string
  value: string
  imageBackgroundSize?: string
  imageBackgroundPosition?: string
  imageTransform?: string
}

function Stat({
  label,
  value,
  imageBackgroundSize = 'cover',
  imageBackgroundPosition = 'left',
  imageTransform = 'scale(1)',
}: StatProps) {
  return (
    <Box
      flex={{ base: 'none', sm: '1' }}
      minW={{ base: 'max-content', md: '110px', xl: '134px' }}
      overflow="hidden"
      position="relative"
      rounded="md"
      shadow="md"
      width={{ base: '100%', md: 'max-content' }}
    >
      <Box height="100%" position="absolute" width="100%">
        <Box
          _groupHover={{
            transform: 'scale(1.01)',
          }}
          backgroundPosition={imageBackgroundPosition}
          backgroundSize={imageBackgroundSize}
          height="100%"
          position="absolute"
          transform={imageTransform}
          transition="transform 0.5s var(--ease-out-cubic)"
          width="100%"
          zIndex="-1"
        >
          <Picture
            altText="MEV Capture Promo Background"
            defaultImgType="jpg"
            directory="/images/homepage/"
            height="100%"
            imgAvif
            imgAvifDark
            imgJpg
            imgName="stone"
            width="100%"
          />
        </Box>
      </Box>
      <Box p="2">
        <Text fontSize="xs" mb="1.5" variant="secondary">
          {label}
        </Text>
        <Text fontSize="md" fontWeight="bold">
          {value}
        </Text>
      </Box>
    </Box>
  )
}

export default Stat
