/* eslint-disable max-len */
export function HookIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      fill="none"
      height={size}
      stroke="currentColor"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        clipPath="url(#a)"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="M13.333 7.5v5A4.167 4.167 0 1 1 5 12.5V9.167l2.5 2.5" />
        <path d="M11.667 5.833a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0ZM13.333 4.167V2.5" />
      </g>
      <defs>
        <clipPath id="a">
          <path d="M0 0h20v20H0z" fill="#fff" />
        </clipPath>
      </defs>
    </svg>
  )
}
