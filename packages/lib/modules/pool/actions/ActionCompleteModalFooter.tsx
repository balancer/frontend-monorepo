import { Button, HStack, VStack, Separator } from '@chakra-ui/react';
import { CornerDownLeft, MessageSquare, ThumbsUp } from 'react-feather'

export function ActionCompleteModalFooter() {
  return (
    <VStack w="full">
      <Separator />
      <HStack justify="space-between" w="full">
        <Button size="xs" variant="ghost"><CornerDownLeft size="14" />Return to pool
                  </Button>
        <Button size="xs" variant="ghost"><ThumbsUp size="14" />Give feedback
                  </Button>
        <Button size="xs" variant="ghost"><MessageSquare size="14" />Ask questions
                  </Button>
      </HStack>
    </VStack>
  );
}
