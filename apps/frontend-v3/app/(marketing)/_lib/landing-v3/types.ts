import { BoxProps, ButtonProps } from '@chakra-ui/react'
import { HTMLMotionProps } from 'framer-motion'

/**
 * Common props needed when using a component with NextLink
 */
export interface NextLinkProps {
  href?: string
  as?: React.ElementType
  target?: string
  rel?: string
}

/**
 * Type definition for a motion-wrapped Chakra Button component
 * Combines Chakra Button props with Framer Motion props and NextLink props
 */
export type MotionButtonProps = Omit<ButtonProps, keyof HTMLMotionProps<'button'>> &
  HTMLMotionProps<'button'> &
  NextLinkProps

/**
 * Type definition for a motion-wrapped Chakra Box component
 * Combines Chakra Box props with Framer Motion props and NextLink props
 */
export type MotionBoxProps = Omit<BoxProps, keyof HTMLMotionProps<'div'>> &
  HTMLMotionProps<'div'> &
  NextLinkProps
