import { useTheme } from '@chakra-ui/react'
import { SVGProps } from 'react'

interface Props extends SVGProps<SVGSVGElement> {
  gradFrom?: string
  gradTo?: string
  variant?: 'gradient' | 'solid'
  id?: string
}

function StarIcon({
  gradFrom = 'yellow',
  gradTo = 'pink',
  variant = 'gradient',
  id,
  ...rest
}: Props) {
  const theme = useTheme()
  const gradientId = `stars-gradient-${gradFrom}-${gradTo}-${id}`

  const startColor = theme.colors[gradTo] ? theme.colors[gradTo]['500'] : gradTo
  const stopColor = theme.colors[gradFrom] ? theme.colors[gradFrom]['500'] : gradFrom
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <defs>
        <linearGradient
          id={gradientId}
          x1="24"
          y1="-11.5"
          x2="2.7273"
          y2="16.3182"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={startColor} />
          <stop offset="1" stopColor={stopColor} />
        </linearGradient>
      </defs>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        // eslint-disable-next-line max-len
        d="M11.888 8.974a4.726 4.726 0 0 0-2.913 2.914l-.885 2.548a.094.094 0 0 1-.18 0l-.885-2.548a4.726 4.726 0 0 0-2.913-2.914L1.563 8.09a.095.095 0 0 1 0-.178l2.549-.885a4.726 4.726 0 0 0 2.913-2.914l.885-2.548a.095.095 0 0 1 .18 0l.885 2.548a4.726 4.726 0 0 0 2.913 2.914l2.549.885a.095.095 0 0 1 0 .178l-2.549.885Z"
        fill={variant === 'gradient' ? `url(#${gradientId})` : 'currentColor'}
      />
    </svg>
  )
}

export default StarIcon
