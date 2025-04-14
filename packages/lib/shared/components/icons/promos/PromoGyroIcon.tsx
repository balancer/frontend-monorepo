import { SVGProps } from 'react'

/* eslint-disable max-len */
export function PromoGyroIcon({
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
      <g clipPath="url(#a)">
        <path
          d="M25.011 4.51a19.49 19.49 0 0 0 0 38.979 19.49 19.49 0 0 0 16.361-8.931h.02V21.963h-5.736v10.713a13.808 13.808 0 0 1-10.645 5.132 13.808 13.808 0 0 1 0-27.616A13.808 13.808 0 0 1 36.483 16.4l4.754-3.164A19.488 19.488 0 0 0 25.01 4.51Zm7.577 17.447c-1.405 2.114-3.248 4.017-5.132 5.899h8.2v-5.893l-3.068-.006Z"
          fill="currentColor"
        />
        <path
          d="M11.474 26.471c3.542-6.215 9.542-11.273 15.327-13.02-10.667 10.046-12.967 18.656-11.53 20.295L12.53 35.75l-4.104-8.812 3.048-.467Z"
          fill="currentColor"
        />
        <path
          d="m12.53 35.75 2.741-2.005c1.233 1.047 5.914-.89 8.616-2.973l6.06 2.522c-1.704 1.422-3.606 2.936-6.364 4.362l-2.24 2.315-8.813-4.221Z"
          fill="url(#b)"
        />
      </g>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="b"
          x1="24.926"
          x2="27.099"
          y1="36.603"
          y2="32.194"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <clipPath id="a">
          <path d="M0 0h39v39H0z" fill="currentColor" transform="translate(5.5 4.5)" />
        </clipPath>
      </defs>
    </svg>
  )
}
