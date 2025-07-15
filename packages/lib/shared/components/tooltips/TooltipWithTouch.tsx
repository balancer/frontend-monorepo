import { Tooltip, Box, TooltipProps } from '@chakra-ui/react'
import { useRef, useState } from 'react'

export function TooltipWithTouch({ children, ...rest }: TooltipProps) {
  const [isLabelOpen, setIsLabelOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsLabelOpen(true)
    }, 100)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsLabelOpen(false)
  }

  return (
    <Tooltip isOpen={isLabelOpen} {...rest}>
      <Box
        onClick={() => setIsLabelOpen(true)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        w="full"
      >
        {children}
      </Box>
    </Tooltip>
  )
}
