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
        opacity: 0.6,
      }}
      _dark={{
        _before: {
          backgroundImage: "url('/images/homepage/marble-dark.jpg')",
        },
      }}
      flex={{ base: 'none', sm: '1' }}
      minW={{ base: '110px', sm: '140px' }}
      overflow="hidden"
      position="relative"
      px="3"
      py="2"
      rounded="md"
      shadow="md"
    >
      <Text fontSize="sm" mb="1" variant="secondary">
        {label}
      </Text>
      <Text fontWeight="bold">{value}</Text>
    </Box>
  )
}

export default Stat
