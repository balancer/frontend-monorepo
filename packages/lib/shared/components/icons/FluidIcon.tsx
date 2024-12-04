/* eslint-disable max-len */
export function FluidIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox="0 0 20 20"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#a)">
        <path
          d="M16.991 10.5h-1.554c-.694 0-1.29-.665-1.368-1.553-.23-2.68-.582-4.661-2.135-4.661-1.554 0-1.942 2.782-1.942 6.215 0 3.431-.389 6.214-1.942 6.214-1.554 0-1.905-1.979-2.136-4.66-.078-.892-.673-1.554-1.37-1.554H2.992"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.554"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path d="M0 0h20v20H0z" fill="#fff" transform="translate(0 .5)" />
        </clipPath>
      </defs>
    </svg>
  )
}
