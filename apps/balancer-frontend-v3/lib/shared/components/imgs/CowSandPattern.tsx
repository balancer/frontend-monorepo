import { SVGProps } from 'react'

export function CowSandPattern({
  color = 'currentColor',
  ...props
}: SVGProps<SVGSVGElement> & { color?: string }) {
  return (
    <svg fill="none" viewBox="0 0 644 368" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke={color}>
        <rect
          height="223"
          opacity=".9"
          rx="40.5"
          vectorEffect="non-scaling-stroke"
          width="419"
          x="416.5"
          y="290.5"
        />
        <rect
          height="90"
          opacity=".9"
          rx="40.5"
          vectorEffect="non-scaling-stroke"
          width="189"
          x="512.5"
          y="74.5"
        />
        <rect
          height="149"
          opacity=".9"
          rx="40.5"
          vectorEffect="non-scaling-stroke"
          width="313"
          x="-64.5"
          y="-45.5"
        />
        <rect
          height="212"
          opacity=".9"
          rx="40.5"
          vectorEffect="non-scaling-stroke"
          width="256"
          x="-79.5"
          y="261.5"
        />
      </g>
    </svg>
  )
}
