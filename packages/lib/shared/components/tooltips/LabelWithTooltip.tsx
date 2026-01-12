'use client'

import { PlacementWithLogical, Text, TextProps } from '@chakra-ui/react'
import { TooltipWithTouch } from './TooltipWithTouch'

interface LabelWithTooltipProps extends TextProps {
  label: string
  tooltip: string
  placement?: PlacementWithLogical
}

export function LabelWithTooltip({ label, tooltip, placement, ...rest }: LabelWithTooltipProps) {
  return (
    <TooltipWithTouch label={tooltip} placement={placement}>
      <Text
        _after={{
          content: '""',
          position: 'absolute',
          left: 0,
          bottom: '-1px',
          width: '100%',
          borderBottom: '1.5px dotted',
          borderColor: 'border.base',
        }}
        cursor="default"
        fontSize="sm"
        fontWeight="semibold"
        mb="xxs"
        mt="xxs"
        position="relative"
        variant="secondary"
        w="max-content"
        {...rest}
      >
        {label}
      </Text>
    </TooltipWithTouch>
  )
}
