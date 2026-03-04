'use client'

import { Portal, Tooltip as ChakraTooltip } from '@chakra-ui/react'
import { PropsWithChildren, ReactNode, forwardRef } from 'react'

export interface TooltipProps extends ChakraTooltip.RootProps {
  content?: ReactNode
  showArrow?: boolean
  portalled?: boolean
  label?: ReactNode // v2 compat alias for content
}

export const Tooltip = forwardRef<HTMLDivElement, PropsWithChildren<TooltipProps>>(
  function Tooltip(
    { children, showArrow = true, portalled = true, content, label, disabled, ...rest },
    ref
  ) {
    const tooltipContent = content ?? label

    if (disabled || !tooltipContent) return <>{children}</>

    return (
      <ChakraTooltip.Root {...rest}>
        <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
        <Portal disabled={!portalled}>
          <ChakraTooltip.Positioner>
            <ChakraTooltip.Content ref={ref}>
              {showArrow && (
                <ChakraTooltip.Arrow>
                  <ChakraTooltip.ArrowTip />
                </ChakraTooltip.Arrow>
              )}
              {tooltipContent}
            </ChakraTooltip.Content>
          </ChakraTooltip.Positioner>
        </Portal>
      </ChakraTooltip.Root>
    )
  }
)
