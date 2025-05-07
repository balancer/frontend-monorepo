import { SVGProps } from 'react'

 
export function GyroIcon({ size = 24, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox="0 0 921 1000"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M500.279.28A499.725 499.725 0 0 0 .557 500a499.723 499.723 0 0 0 499.722 499.722 499.724 499.724 0 0 0 419.518-229.004h.522V447.781H773.232v274.674a354.052 354.052 0 0 1-272.953 131.598 354.054 354.054 0 0 1-250.354-604.406 354.057 354.057 0 0 1 250.354-103.699A354.053 354.053 0 0 1 794.42 305.154l121.906-81.129A499.723 499.723 0 0 0 500.279.279Zm194.285 447.335c-36.037 54.22-83.283 103.001-131.601 151.261h210.268l.001-151.095-78.668-.166Z"
        fill="currentColor"
      />
      <path
        d="M153.181 563.361c90.824-159.364 244.656-289.041 392.986-333.869-273.513 257.617-332.493 478.383-295.635 520.396l-70.286 51.393L75.027 575.339l78.154-11.978Z"
        fill="currentColor"
      />
      <path
        d="m180.248 801.281 70.286-51.393c31.63 26.842 151.637-22.839 220.912-76.247l155.388 64.674c-43.692 36.458-92.447 75.273-163.183 111.833l-57.402 59.363-226.001-108.23Z"
        fill="url(#a)"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="a"
          x1="498.104"
          x2="553.815"
          y1="823.168"
          y2="710.107"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
