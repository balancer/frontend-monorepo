import { Box, HStack, Text, Tooltip } from '@chakra-ui/react'
import { AlertTriangle } from 'lucide-react'

export function TokenMissingPriceWarning({ message }: { message: string }) {
  return (
    <HStack color="font.warning" spacing="xs">
      <Text color="font.warning">—</Text>
      <Tooltip label={message} placement="top">
        <Box zIndex="0">
          <AlertTriangle size={16} />
        </Box>
      </Tooltip>
    </HStack>
  )
}
