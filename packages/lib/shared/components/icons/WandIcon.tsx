import { SVGProps } from 'react'

export function WandIcon({ size = 24, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 216 194"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      height={size}
      width={size}
    >
      <g
        clip-path="url(#a)"
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      >
        <path d="M184 97v48m-24-24h48M48 9v48M24 33h48m64 120v32m-16-16h32M112 49l32 32m6-70L10 151c-3 3-3 8 0 11l21 21c3 3 8 3 11 0L182 43c3-3 3-8 0-11l-21-21c-3-3-8-3-11 0Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path d="M0 0h216v194H0z" fill="#fff" />
        </clipPath>
      </defs>
    </svg>
  )
}
