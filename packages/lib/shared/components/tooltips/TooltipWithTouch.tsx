import { Box } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { Tooltip, TooltipProps } from './Tooltip'

type TooltipWithTouchProps = TooltipProps & {
  fullWidth?: boolean
  isHidden?: boolean
}

export function TooltipWithTouch({
  children,
  fullWidth = false,
  disabled,
  isHidden = false,
  ...rest
}: TooltipWithTouchProps) {
  const [isLabelOpen, setIsLabelOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (disabled) return
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

  const handleClick = () => {
    if (disabled) return
    setIsLabelOpen(true)
  }

  if (isHidden) return <>{children}</>

  return (
    <Tooltip open={isLabelOpen} {...rest}>
      <Box
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        w={fullWidth ? 'full' : 'auto'}
      >
        {children}
      </Box>
    </Tooltip>
  )
}
