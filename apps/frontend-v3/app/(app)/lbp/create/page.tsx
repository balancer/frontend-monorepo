import { VStack, Box, Text, HStack } from '@chakra-ui/react'
import { LbpFormProvider } from '@repo/lib/modules/lbp/LbpFormProvider'
import { LbpForm } from '@repo/lib/modules/lbp/LbpForm'
import { LbpPreview } from '@repo/lib/modules/lbp/LbpPreview'
export default function LBPCreatePage() {
  return (
    <LbpFormProvider>
      <VStack spacing="lg">
        <Box border="1px solid red" w="full">
          <Text>Banner</Text>
        </Box>
        <HStack align="start" spacing="lg" w="full">
          <LbpForm />
          <LbpPreview />
        </HStack>
      </VStack>
    </LbpFormProvider>
  )
}
