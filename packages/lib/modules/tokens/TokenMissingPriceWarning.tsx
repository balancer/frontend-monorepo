import { HStack, Text, Tooltip } from '@chakra-ui/react'
import { AlertTriangle } from 'react-feather'

export function TokenMissingPriceWarning({ message }: { message: string }) {
  return (
    <HStack color="font.warning" spacing="xs">
      <Text color="font.warning">—</Text>
      <Tooltip label={message} placement="top">
        <AlertTriangle size={16} />
      </Tooltip>
    </HStack>
  )
}
