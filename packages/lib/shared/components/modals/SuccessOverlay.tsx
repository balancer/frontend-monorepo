import React from 'react'
import { Box, Center, ModalOverlay } from '@chakra-ui/react'

export function SuccessOverlay({ startAnimation }: { startAnimation?: boolean }) {
  return (
    <ModalOverlay>
      {startAnimation && (
        <Center h="full" position="absolute" w="full">
          <Box className="ripple ripple-1" />
          <Box className="ripple ripple-2" />
          <Box className="ripple ripple-3" />
        </Center>
      )}
    </ModalOverlay>
  )
}
