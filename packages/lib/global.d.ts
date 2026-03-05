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
  // Allow framer-motion props on ALL Chakra components via JsxStyleProps (used with asChild pattern)
  // Box is typed as ChakraComponent<"div", {}> → HTMLChakraProps<"div"> → JsxHtmlProps<..., Assign<JsxStyleProps, {}>>
  // BoxProps augmentation does NOT affect Box's type; JsxStyleProps IS in the chain
  interface JsxStyleProps {
    animate?: any
    initial?: any
    exit?: any
    variants?: any
    whileHover?: any
    whileTap?: any
    whileFocus?: any
    whileInView?: any
    layoutId?: any
    layout?: any
    textColor?: string
    isTruncated?: boolean
    noOfLines?: number
    align?: string
    sx?: any
    style?: any
  }
  interface StackProps {
    textColor?: string
  }
  // Keep BoxProps/StackProps for direction and style (used directly in some components)
  interface BoxProps {
    direction?: any
    transition?: any
    style?: any
  }
  interface StackProps {
    direction?: any
    transition?: any
    style?: any
  }
  // Custom variants: allow any string until recipes are migrated
  interface ButtonProps {
    variant?: any
    size?: any
    isExternal?: boolean
    textColor?: string
    as?: any
    prefetch?: boolean
    href?: string
    rightIcon?: React.ReactNode
    isLoading?: boolean
    loadingText?: string
    isDisabled?: boolean
    width?: any
  }
  interface TextProps {
    variant?: any
    fontSize?: any
    lineClamp?: number
    size?: any
    as?: any
    htmlFor?: string
  }
  interface AlertRootProps {
    variant?: any
  }
  interface HeadingProps {
    variant?: any
    size?: any
    sx?: any
  }
  interface LinkProps {
    variant?: any
    isExternal?: boolean
    as?: any
    prefetch?: boolean
  }
  interface IconButtonProps {
    as?: any
  }
  interface AccordionRootProps {
    variant?: any
  }
  interface ListRootProps {
    variant?: any
  }
  interface NativeSelectFieldProps {
    onValueChange?: any
    variant?: any
    [key: string]: any
  }
  interface InputGroupProps {
    size?: any
  }
  interface PopoverArrowProps {
    css?: any
  }
  interface InputProps {
    onValueChange?: any
    invalid?: boolean
  }
  interface ProgressCircleRootProps {
    size?: any
  }
  interface TextareaProps {
    invalid?: boolean
  }
  interface PopoverCloseTriggerProps {
    [key: string]: any
  }
  interface StepsSeparatorProps {
    w?: string
    [key: string]: any
  }
  interface TabsRootProps {
    variant?: any
  }
  interface CardRootProps {
    variant?: any
    sx?: any
  }
  interface BadgeProps {
    variant?: any
    sx?: any
  }
  interface TagProps {
    variant?: any
  }
  interface IconButtonProps {
    variant?: any
    size?: any
    isRound?: boolean
  }
  interface IconProps {
    size?: number | string
    [key: string]: any
  }
  interface AccordionItemIndicatorProps {
    color?: string
    textColor?: string
    [key: string]: any
  }
  interface CardRootProps {
    sx?: any
  }
  interface CardHeaderProps {
    isTruncated?: boolean
    justify?: string
    children?: React.ReactNode
    [key: string]: any
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

  // InputGroup accepts multiple children (Input + InputElement siblings)
  interface InputGroupProps {
    children?: any
  }
  // Switch compound component children
  interface SwitchControlProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface SwitchThumbProps {
    children?: React.ReactNode
    [key: string]: any
  }
  // Slider.Range
  interface SliderRangeProps {
    children?: React.ReactNode
    [key: string]: any
  }
  // SliderMarker
  interface SliderMarkerProps {
    children?: React.ReactNode
    [key: string]: any
  }
  // NumberInput compound children
  interface NumberInputRootProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface NumberInputInputProps {
    children?: React.ReactNode
    [key: string]: any
  }
  // v2 removed type aliases → v3 equivalents
  type ModalProps = DialogRootProps
  type CardProps = CardRootProps
  type AlertProps = AlertRootProps
  type AlertStatus = 'info' | 'warning' | 'success' | 'error' | 'loading'
  // Progress.Track accepts children
  interface ProgressTrackProps {
    children?: React.ReactNode
    [key: string]: any
  }
  // Card.Footer accepts justify
  interface CardFooterProps {
    justify?: string
    [key: string]: any
  }
  // Field compound component children
  interface FieldLabelProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface FieldHelperTextProps {
    children?: React.ReactNode
    [key: string]: any
  }
  interface FieldErrorTextProps {
    children?: React.ReactNode
    [key: string]: any
  }
  // Avatar.Image accepts src
  interface AvatarImageProps {
    src?: string
    [key: string]: any
  }
  // CheckboxGroup v3 props
  interface CheckboxGroupProps {
    defaultValue?: string[]
    onValueChange?: (value: string[]) => void
    children?: React.ReactNode
    [key: string]: any
  }
}
