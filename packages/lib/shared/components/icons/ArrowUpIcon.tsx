import { SVGProps } from 'react'

export function ArrowUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 10 10"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 7.79999L5 2.19999"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.8"
      />
      <path
        d="M2.20078 5.00116L5.00078 2.20116L7.80078 5.00116"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.8"
      />
    </svg>
  )
}
