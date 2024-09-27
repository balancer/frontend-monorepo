import { Box, BoxProps, forwardRef } from '@chakra-ui/react'
import { Info } from 'react-feather'

export const InfoIcon = forwardRef<BoxProps, 'div'>((props, ref) => {
  return (
    <Box color="grayText" ref={ref} {...props}>
      <Info size={16} />
    </Box>
  )
})
