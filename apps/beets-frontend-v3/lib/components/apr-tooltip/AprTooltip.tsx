import { GqlPoolAprItem } from '@repo/lib/shared/services/api/generated/graphql'
import { Tooltip } from '@chakra-ui/react'

interface AprTooltipProps {
  apr: string
  items: GqlPoolAprItem[]
  onlySparkles?: boolean
}

export default function AprTooltip({ apr, items, onlySparkles }: AprTooltipProps) {
  // Simple tooltip that shows APR breakdown
  const tooltipContent = items
    .map(item => `${item.title}: ${item.apr.toFixed(2)}%`)
    .join('\n')

  return (
    <Tooltip label={tooltipContent}>
      <span>{onlySparkles ? '✨' : apr}</span>
    </Tooltip>
  )
}
