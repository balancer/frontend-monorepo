import React from 'react'
import { Box, Center, Dialog } from '@chakra-ui/react'

export function SuccessOverlay({ startAnimation }: { startAnimation?: boolean }) {
  return (
    <Dialog.Backdrop>
      {startAnimation && (
        <Center h="full" position="absolute" w="full">
          <Box className="ripple ripple-1" />
          <Box className="ripple ripple-2" />
          <Box className="ripple ripple-3" />
        </Center>
      )}
    </Dialog.Backdrop>
  )
}
