import { Tooltip, Box, TooltipProps } from '@chakra-ui/react'
import { useRef, useState } from 'react'

type TooltipWithTouchProps = TooltipProps & {
  fullWidth?: boolean
}

export function TooltipWithTouch({ children, fullWidth = false, ...rest }: TooltipWithTouchProps) {
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
    <Tooltip bg="background.level4" color="font.secondary" isOpen={isLabelOpen} {...rest}>
      <Box
        onClick={() => setIsLabelOpen(true)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        w={fullWidth ? 'full' : 'auto'}
      >
        {children}
      </Box>
    </Tooltip>
  )
}
