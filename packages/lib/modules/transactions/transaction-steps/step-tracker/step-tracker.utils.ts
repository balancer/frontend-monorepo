import { DialogContentProps } from '@chakra-ui/react'

export function getStylesForModalContentWithStepTracker(isDesktop: boolean): DialogContentProps {
  return isDesktop ? { left: '-160px', position: 'relative' } : {}
}
