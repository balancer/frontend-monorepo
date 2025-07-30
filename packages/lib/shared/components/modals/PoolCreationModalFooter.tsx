import { ModalFooter, Text, HStack } from '@chakra-ui/react'

export function PoolCreationModalFooter({ onReset }: { onReset: () => void }) {
  return (
    <ModalFooter>
      <HStack justify="center" width="full">
        <Text
          _hover={{ textDecoration: 'underline' }}
          cursor="pointer"
          fontSize="sm"
          onClick={() => {
            onReset()
          }}
          pb="sm"
          variant="secondary"
        >
          Abandon LBP and reset progress
        </Text>
      </HStack>
    </ModalFooter>
  )
}
