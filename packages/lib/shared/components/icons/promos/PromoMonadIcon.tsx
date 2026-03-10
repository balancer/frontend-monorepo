import { SVGProps } from 'react'

export function PromoMonadIcon({
  size = 24,
  ...props
}: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      height={size}
      width={size}
      {...props}
      fill="none"
      viewBox="0 0 44 44"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#a)">
        <path
          d="M22 0C15.732 0 .293 15.647.293 22S15.732 44 22 44s21.707-15.647 21.707-22S28.268 0 22 0m-3.383 34.58c-2.643-.73-9.75-13.33-9.03-16.008.721-2.68 13.152-9.882 15.796-9.152 2.643.73 9.75 13.33 9.03 16.008-.721 2.68-13.152 9.882-15.796 9.152"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path d="M0 0h44v44H0z" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  )
}
