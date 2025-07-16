import { SVGProps } from 'react'

export function PromoReclammIcon({
  size = 24,
  ...props
}: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      height={size}
      width={size}
    >
      <path
        d="M12 25v-2l-5-4a1 1 0 1 0-1 1l4 4-4 4a1 1 0 0 0 1 1l5-4ZM2 24v1h9v-2H2v1ZM15 9a3 3 0 0 1 5 0v31a3 3 0 0 1-5 0V9Zm7 0a3 3 0 0 1 5 0v31a3 3 0 0 1-5 0V9Zm7 0a3 3 0 0 1 5 0v31a3 3 0 0 1-5 0V9Zm7 14v2l5 4a1 1 0 0 0 1-1l-4-4 4-4a1 1 0 0 0-1-1l-5 4Zm10 1v-1h-9v2h9v-1Z"
        fill="currentColor"
      />
    </svg>
  )
}
