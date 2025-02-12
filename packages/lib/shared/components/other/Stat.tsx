import { Box, Text } from '@chakra-ui/react'

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
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: "url('/images/homepage/marble.jpg')",
        backgroundSize: imageBackgroundSize,
        backgroundPosition: imageBackgroundPosition,
        transform: imageTransform,
        zIndex: -1,
      }}
      _dark={{
        _before: {
          backgroundImage: "url('/images/homepage/marble-dark.jpg')",
        },
      }}
      flex={{ base: 'none', sm: '1' }}
      minW={{ base: 'max-content', md: '110px', xl: '134px' }}
      overflow="hidden"
      position="relative"
      px="2"
      py="2"
      rounded="md"
      shadow="md"
      width={{ base: '100%', md: 'max-content' }}
    >
      <Text fontSize="xs" mb="1.5" variant="secondary">
        {label}
      </Text>
      <Text fontSize="md" fontWeight="bold">
        {value}
      </Text>
    </Box>
  )
}

export default Stat
