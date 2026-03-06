import { forwardRef } from 'react'
import { Box, BoxProps } from '@chakra-ui/react'
import { Info } from 'react-feather'

export const InfoIcon = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  return (
    <Box color="grayText" ref={ref} {...props}>
      <Info size={16} />
    </Box>
  )
})
