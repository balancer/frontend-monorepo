import { SVGProps } from 'react'

/* eslint-disable max-len */
export function BoostedPoolIcon({
  size = 24,
  ...props
}: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      height={size}
      width={size}
      {...props}
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M9.2 27.801V42h16.945c2.613 0 4.863-.44 6.75-1.318 1.886-.88 3.34-2.086 4.359-3.622 1.031-1.535 1.547-3.287 1.547-5.255 0-1.7-.375-3.176-1.125-4.43a8.08 8.08 0 0 0-3.024-2.97c-1.254-.72-2.646-1.113-4.177-1.177L18.687 37.38l1.198-9.579H9.199Zm0-.109 11.882-14.26-1.197 9.58 10.618-.151c1.366-.284 2.561-.783 3.587-1.498a7.76 7.76 0 0 0 2.426-2.742c.586-1.09.879-2.297.879-3.621 0-1.828-.48-3.416-1.442-4.764-.95-1.347-2.361-2.39-4.236-3.129C29.854 6.37 27.55 6 24.809 6H9.199v21.692Z"
        fill="currentColor"
        fillRule="evenodd"
        style={{ mixBlendMode: 'difference' }}
      />
    </svg>
  )
}
