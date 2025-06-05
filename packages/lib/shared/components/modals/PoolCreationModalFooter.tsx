'use client'

import { ModalFooter, Text, HStack } from '@chakra-ui/react'

export function PoolCreationModalFooter({ onReset }: { onReset: () => void }) {
  return (
    <ModalFooter>
      <HStack width="full" justify="center">
        <Text
          cursor="pointer"
          _hover={{ textDecoration: 'underline' }}
          onClick={() => {
            onReset()
          }}
        >
          Reset Progress
        </Text>
      </HStack>
    </ModalFooter>
  )
}
