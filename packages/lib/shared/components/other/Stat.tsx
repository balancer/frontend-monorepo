import { Box, Text } from '@chakra-ui/react'
import { Picture } from './Picture'
import { ReactNode } from 'react'

interface StatProps {
  label: string
  value: ReactNode
  imageBackgroundSize?: string
  imageBackgroundPosition?: string
  imageTransform?: string
  popover?: boolean
}

function Stat({
  label,
  value,
  imageBackgroundSize = 'cover',
  imageBackgroundPosition = 'left',
  imageTransform = 'scale(1)',
  popover = false,
}: StatProps) {
  return (
    <Box
      flex="1"
      minW={{ base: '100px', sm: '132px', lg: '132px' }}
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
        <Text
          fontSize="xs"
          mb="1.5"
          position="relative"
          variant="secondary"
          w="fit-content"
          {...(popover
            ? {
                _after: {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '-1.5px',
                  height: '0px',
                  borderBottom: '1px dotted',
                  opacity: 0.5,
                  width: '100%',
                  pointerEvents: 'none',
                },
              }
            : {})}
        >
          {label}
        </Text>
        <Text className="home-stats" fontSize="md" fontWeight="bold" letterSpacing="-0.6px">
          {value}
        </Text>
      </Box>
    </Box>
  )
}

export default Stat
