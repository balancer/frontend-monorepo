import { ModalContentProps } from '@chakra-ui/react'

export function getStylesForModalContentWithStepTracker(isDesktop: boolean): ModalContentProps {
  return isDesktop ? { left: '-160px', position: 'relative' } : {}
}
