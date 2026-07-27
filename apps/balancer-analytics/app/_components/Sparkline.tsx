'use client'

import { Box, useToken } from '@chakra-ui/react'
import { useId, useMemo } from 'react'

type Props = {
  values: number[]
  width?: number
  height?: number
  stroke?: string // theme token or hex
  smooth?: boolean
}

export function Sparkline({
  values,
  width = 120,
  height = 36,
  stroke = 'green.400',
  smooth = true,
}: Props) {
  const [strokeColor] = useToken('colors', [stroke]) as [string]
  const color = strokeColor || stroke
  const id = useId()

  const { d, area } = useMemo(() => {
    if (!values?.length) return { d: '', area: '' }
    const min = Math.min(...values),
      max = Math.max(...values)
    const range = max - min || 1
    const stepX = width / (values.length - 1)
    const pts: [number, number][] = values.map((v, i) => [
      i * stepX,
      height - ((v - min) / range) * (height - 4) - 2,
    ])
    let d = `M ${pts[0][0]} ${pts[0][1]}`
    if (smooth) {
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1],
          [x1, y1] = pts[i]
        const cx = (x0 + x1) / 2
        d += ` Q ${cx} ${y0} ${cx} ${(y0 + y1) / 2} T ${x1} ${y1}`
      }
    } else {
      for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0]} ${pts[i][1]}`
    }
    const area = d + ` L ${width} ${height} L 0 ${height} Z`
    return { d, area }
  }, [values, width, height, smooth])

  if (!values?.length) return null

  return (
    <Box
      as="svg"
      display="block"
      h={`${height}px`}
      overflow="visible"
      viewBox={`0 0 ${width} ${height}`}
      w={`${width}px`}
    >
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${id})`} />
      <path d={d} fill="none" stroke={color} strokeLinecap="round" strokeWidth="1.5" />
    </Box>
  )
}
