import { Tooltip, Box, TooltipProps } from '@chakra-ui/react'
import { useState } from 'react'

export function TooltipWithTouch({ children, ...rest }: TooltipProps) {
  const [isLabelOpen, setIsLabelOpen] = useState(false)

  return (
    <Tooltip isOpen={isLabelOpen} {...rest}>
      <Box
        onClick={() => setIsLabelOpen(true)}
        onMouseEnter={() => setIsLabelOpen(true)}
        onMouseLeave={() => setIsLabelOpen(false)}
        w="full"
      >
        {children}
      </Box>
    </Tooltip>
  )
}
