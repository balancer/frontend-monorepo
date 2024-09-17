import { Button, Divider, HStack, VStack } from '@chakra-ui/react'
import { CornerDownLeft, MessageSquare, ThumbsUp } from 'react-feather'

export function ActionCompleteModalFooter() {
  return (
    <VStack w="full">
      <Divider />
      <HStack justify="space-between" w="full">
        <Button variant="ghost" leftIcon={<CornerDownLeft size="14" />} size="xs">
          Return to pool
        </Button>
        <Button variant="ghost" leftIcon={<ThumbsUp size="14" />} size="xs">
          Give feedback
        </Button>
        <Button variant="ghost" leftIcon={<MessageSquare size="14" />} size="xs">
          Ask questions
        </Button>
      </HStack>
    </VStack>
  )
}
