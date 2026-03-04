import { HumanAmount } from '@balancer/sdk'
import React from 'react'

/*
Global type overrides for TypeScript
*/
declare module 'viem' {
  //Override viem's formatUnits function to return HumanAmount (AKA `${number}`) to improve type safety
  export function formatUnits(value: bigint, decimals: number): HumanAmount
}

declare module 'react' {
  interface HTMLAttributes<T> extends React.HTMLAttributes<T> {
    popover?: 'auto' | 'manual' | boolean
  }

  interface ButtonHTMLAttributes<T> extends React.HTMLAttributes<T> {
    popovertarget?: string
    popovertargetaction?: string
  }
}

/*
 * Chakra UI v3 type augmentations:
 * 1. Compound component props missing `children` due to React 19 + complex generic resolution
 * 2. Custom variants/sizes not yet migrated to v3 recipes (primary, secondary, tertiary, h4, h5, etc.)
 * 3. Removed v2 props/exports that still appear in the codebase
 */
declare module '@chakra-ui/react' {
  // Custom variants: allow any string until recipes are migrated
  interface ButtonProps {
    variant?: string
    size?: string
  }
  interface TextProps {
    variant?: string
    fontSize?: string | number
  }
  interface HeadingProps {
    variant?: string
    size?: string
  }
  interface LinkProps {
    variant?: string
  }
  interface CardRootProps {
    variant?: string
  }
  interface BadgeProps {
    variant?: string
  }
  interface TagProps {
    variant?: string
  }
  interface IconButtonProps {
    variant?: string
    size?: string
  }
  // PopoverArrow and HoverCard.Arrow accept bg styling
  interface PopoverArrowProps {
    bg?: string
  }
  interface HoverCardArrowProps {
    bg?: string
  }
  // ProgressCircle.Range accepts stroke
  interface ProgressCircleRangeProps {
    stroke?: string
  }
  // PopoverTrigger asChild support
  interface PopoverTriggerProps {
    children?: React.ReactNode
    asChild?: boolean
  }
  interface CheckboxControlProps {
    children?: React.ReactNode
  }
  interface CheckboxLabelProps {
    children?: React.ReactNode
  }
  interface HoverCardTriggerProps {
    children?: React.ReactNode
    asChild?: boolean
  }
  interface HoverCardPositionerProps {
    children?: React.ReactNode
  }
  // Compound components need style props + children (TypeScript fails to resolve complex generics)
  interface HoverCardContentProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface HoverCardPositionerProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface DialogPositionerProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface DialogContentProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface DialogBackdropProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface PopoverContentProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface PopoverTriggerProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface PopoverPositionerProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface PopoverTitleProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface ProgressCircleCircleProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface AccordionItemProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface AccordionItemTriggerProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface AccordionItemContentProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface RadioGroupItemProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface RadioGroupItemTextProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface SliderTrackProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface StepsListProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface StepsItemProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface DrawerPositionerProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface DrawerContentProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface TabsListProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface TabsTriggerProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface TabsContentProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface TabsContentGroupProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface StepsIndicatorProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface StepsStatusProps {
    children?: React.ReactNode
    [key: string]: any
  }
  // Tooltip compound components need children
  interface TooltipTriggerProps {
    children?: React.ReactNode
    asChild?: boolean
  }
  interface TooltipPositionerProps {
    children?: React.ReactNode
  }
  interface TooltipContentProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface TooltipArrowProps {
    children?: React.ReactNode
  }
  interface TooltipArrowTipProps {
    children?: React.ReactNode
  }
  // Toaster accepts children render function
  interface ToasterProps {
    children?: (toast: any) => React.ReactNode
    toaster?: any
    [key: string]: any
  }

  // v2 removed type aliases → v3 equivalents
  type ModalProps = DialogRootProps
  type CardProps = CardRootProps
  type AlertProps = AlertRootProps
  type AlertStatus = 'info' | 'warning' | 'success' | 'error' | 'loading'
}
