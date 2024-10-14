import { SVGProps } from 'react'

export function CowSandPattern({
  color = 'currentColor',
  ...props
}: SVGProps<SVGSVGElement> & { color?: string }) {
  return (
    <svg viewBox="0 0 644 368" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke={color}>
        <rect
          vectorEffect="non-scaling-stroke"
          opacity=".9"
          x="416.5"
          y="290.5"
          width="419"
          height="223"
          rx="40.5"
        />
        <rect
          vectorEffect="non-scaling-stroke"
          opacity=".9"
          x="512.5"
          y="74.5"
          width="189"
          height="90"
          rx="40.5"
        />
        <rect
          vectorEffect="non-scaling-stroke"
          opacity=".9"
          x="-64.5"
          y="-45.5"
          width="313"
          height="149"
          rx="40.5"
        />
        <rect
          vectorEffect="non-scaling-stroke"
          opacity=".9"
          x="-79.5"
          y="261.5"
          width="256"
          height="212"
          rx="40.5"
        />
      </g>
    </svg>
  )
}
