import { SVGProps } from 'react'

export function SteepCurve(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="56"
      viewBox="0 0 70 56"
      width="70"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0.5 1C0.5 19.625 20.05 54.95 68.25 55.25"
        opacity="0.5"
        stroke="#A0AEC0"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 1C6.5 23.625 10.05 49.95 68.25 50.25"
        opacity="0.5"
        stroke="#A0AEC0"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
      <path
        d="M12.5 1C12.5 32.625 3.05001 43.95 68.25 45.25"
        stroke="url(#paint0_linear_740_15111)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_740_15111"
          x1="11.3426"
          x2="73.4669"
          y1="25.3176"
          y2="25.0597"
        >
          <stop stopColor="#B3AEF5" />
          <stop offset="0.260439" stopColor="#D7CBE7" />
          <stop offset="0.458359" stopColor="#E5C8C8" />
          <stop offset="0.905621" stopColor="#EAA879" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function FlatCurve(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="56"
      viewBox="0 0 70 56"
      width="70"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12.5 1C12.5 32.625 3.05001 43.95 68.25 45.25"
        opacity="0.5"
        stroke="#A0AEC0"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
      <path
        d="M0.5 1C0.5 19.625 20.05 54.95 68.25 55.25"
        opacity="0.5"
        stroke="#A0AEC0"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 1C6.5 23.625 10.05 49.95 68.25 50.25"
        stroke="url(#paint0_linear_740_15119)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_740_15119"
          x1="5.75302"
          x2="73.9793"
          y1="28.0653"
          y2="27.7858"
        >
          <stop stopColor="#B3AEF5" />
          <stop offset="0.260439" stopColor="#D7CBE7" />
          <stop offset="0.458359" stopColor="#E5C8C8" />
          <stop offset="0.905621" stopColor="#EAA879" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function VeryFlatCurve(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="57"
      viewBox="0 0 70 57"
      width="70"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7 1C7 23.625 10.55 49.95 68.75 50.25"
        opacity="0.5"
        stroke="#A0AEC0"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
      <path
        d="M13 1C13 32.625 3.54998 43.95 68.75 45.25"
        opacity="0.5"
        stroke="#A0AEC0"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
      <path
        d="M1 1C1 19.625 20.55 54.95 68.75 55.25"
        stroke="url(#paint0_linear_740_15127)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_740_15127"
          x1="0.180444"
          x2="75.036"
          y1="30.8131"
          y2="30.5077"
        >
          <stop stopColor="#B3AEF5" />
          <stop offset="0.260439" stopColor="#D7CBE7" />
          <stop offset="0.458359" stopColor="#E5C8C8" />
          <stop offset="0.905621" stopColor="#EAA879" />
        </linearGradient>
      </defs>
    </svg>
  )
}
