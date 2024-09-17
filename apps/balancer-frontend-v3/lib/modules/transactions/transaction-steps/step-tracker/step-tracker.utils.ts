/* eslint-disable react-hooks/exhaustive-deps */
import { ModalContentProps } from '@chakra-ui/react'

export function getStylesForModalContentWithStepTracker(isDesktop: boolean): ModalContentProps {
  return isDesktop ? { left: '-100px', position: 'relative' } : {}
}
