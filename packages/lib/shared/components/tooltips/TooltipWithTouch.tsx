import { Tooltip, Box, TooltipProps } from '@chakra-ui/react'
import { useRef, useState } from 'react'

type TooltipWithTouchProps = TooltipProps & {
  fullWidth?: boolean
  isHidden?: boolean
}

export function TooltipWithTouch({
  children,
  fullWidth = false,
  isDisabled,
  isHidden = false,
  ...rest
}: TooltipWithTouchProps) {
  const [isLabelOpen, setIsLabelOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (isDisabled) return
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
    if (isDisabled) return
    setIsLabelOpen(true)
  }

  if (isHidden) return <>{children}</>

  return (
    <Tooltip
      bg="background.level4"
      color="font.secondary"
      isDisabled={isDisabled}
      isOpen={isLabelOpen}
      {...rest}
    >
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
