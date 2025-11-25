import { SVGProps } from 'react'

export function PlugIcon({ size = 20, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      height={size}
      viewBox="0 0 20 20"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" fill="" r="10" />
      <path
        d="M4.667 15.335 7 13m5-8.333L9.667 7.001m5.666 1L13 10.335M8.523 6 14 11.478l-1.37 1.37A3.873 3.873 0 1 1 7.155 7.37L8.524 6Z"
        stroke="#00D395"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}
