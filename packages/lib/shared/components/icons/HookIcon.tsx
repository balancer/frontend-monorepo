import { SVGProps } from 'react'

/* eslint-disable max-len */
export function HookIcon({ size = 24, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      height={size}
      width={size}
      {...props}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 9v6a5 5 0 0 1-10 0v-4l3 3" />
      <path d="M14 7a2 2 0 1 0 4 0 2 2 0 1 0-4 0M16 5V3" />
    </svg>
  )
}
