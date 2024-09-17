import { Button, Divider, HStack, VStack } from '@chakra-ui/react'
import { CornerDownLeft, MessageSquare, ThumbsUp } from 'react-feather'

export function ActionCompleteModalFooter() {
  return (
    <VStack w="full">
      <Divider />
      <HStack justify="space-between" w="full">
        <Button leftIcon={<CornerDownLeft size="14" />} size="xs" variant="ghost">
          Return to pool
        </Button>
        <Button leftIcon={<ThumbsUp size="14" />} size="xs" variant="ghost">
          Give feedback
        </Button>
        <Button leftIcon={<MessageSquare size="14" />} size="xs" variant="ghost">
          Ask questions
        </Button>
      </HStack>
    </VStack>
  )
}
