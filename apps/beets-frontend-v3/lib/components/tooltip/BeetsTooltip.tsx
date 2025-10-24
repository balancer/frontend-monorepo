import { Tooltip, TooltipProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface BeetsTooltipProps extends Omit<TooltipProps, 'children'> {
  label: string
  noImage?: boolean
  children: ReactNode
}

export default function BeetsTooltip({ label, noImage, children, ...props }: BeetsTooltipProps) {
  return (
    <Tooltip label={label} {...props}>
      {children}
    </Tooltip>
  )
}
