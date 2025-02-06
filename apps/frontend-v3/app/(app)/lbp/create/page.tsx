import { VStack, Box, Text, HStack } from '@chakra-ui/react'

export default function LBPCreatePage() {
  return (
    <VStack spacing="lg">
      <Box border="1px solid red" w="full">
        <Text>Banner</Text>
      </Box>
      <HStack align="start" spacing="lg" w="full">
        <Box border="1px solid red" h="4xl" w="full">
          <Text>Form</Text>
        </Box>
        <Box border="1px solid red" display={{ base: 'none', md: 'block' }} h="lg" w="full">
          <Text>Preview</Text>
        </Box>
      </HStack>
    </VStack>
  )
}
