import { SVGProps } from 'react'

export function GyroIcon({ size = 30, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      height={size}
      viewBox="0 0 264.583 264.583"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="gyro-a">
          <stop offset="0" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          gradientTransform="translate(-3765.208 3112.523)"
          gradientUnits="userSpaceOnUse"
          href="#gyro-a"
          id="gyro-b"
          x1="7780.194"
          x2="7791.332"
          y1="-3459.823"
          y2="-3437.221"
        />
      </defs>
      <g transform="matrix(1.32353 0 0 -1.32353 -5182.162 -241.866)">
        <path
          // eslint-disable-next-line max-len
          d="M4015.421-182.799a99.898 99.898 0 0 1-99.898-99.898 99.898 99.898 0 0 1 99.898-99.898 99.898 99.898 0 0 1 83.865 45.78h.104v64.557h-29.403v-54.909a70.778 70.778 0 0 0-54.566-26.307 70.778 70.778 0 0 0-70.778 70.777 70.778 70.778 0 0 0 70.778 70.778 70.778 70.778 0 0 0 58.801-31.826l24.37 16.218a99.898 99.898 0 0 1-83.17 44.728zm38.84-89.425c-7.204-10.84-16.65-20.591-26.308-30.239h42.034v30.205z"
          fill="currentColor"
        />
        <path
          // eslint-disable-next-line max-len
          d="M3946.034-295.363c18.156 31.858 48.909 57.782 78.561 66.743-54.677-51.5-66.468-95.632-59.1-104.031l-14.05-10.274-21.034 45.168z"
          fill="currentColor"
        />
        <path
          // eslint-disable-next-line max-len
          d="m3951.445-342.925 14.05 10.274c6.323-5.366 30.314 4.566 44.162 15.242l31.063-12.929c-8.734-7.288-18.48-15.047-32.621-22.356l-11.475-11.867-45.18 21.636"
          fill="url(#gyro-b)"
        />
      </g>
    </svg>
  )
}
