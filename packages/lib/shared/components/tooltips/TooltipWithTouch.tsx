import { Tooltip, Box, TooltipProps } from '@chakra-ui/react'
import { useState } from 'react'

export const TooltipWithTouch = ({ children, ...rest }: TooltipProps) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false)

  return (
    <Tooltip isOpen={isLabelOpen} {...rest}>
      <Box
        w="full"
        onMouseEnter={() => setIsLabelOpen(true)}
        onMouseLeave={() => setIsLabelOpen(false)}
        onClick={() => setIsLabelOpen(true)}
      >
        {children}
      </Box>
    </Tooltip>
  )
}
