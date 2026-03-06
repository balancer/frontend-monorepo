import { Box, HStack, Text } from '@chakra-ui/react'
import { Tooltip } from '../../shared/components/tooltips/Tooltip'
import { AlertTriangle } from 'react-feather'

export function TokenMissingPriceWarning({ message }: { message: string }) {
  return (
    <HStack color="font.warning" gap="xs">
      <Text color="font.warning">—</Text>
      <Tooltip
        content={message}
        positioning={{
          placement: 'top',
        }}
      >
        <Box zIndex="0">
          <AlertTriangle size={16} />
        </Box>
      </Tooltip>
    </HStack>
  )
}
