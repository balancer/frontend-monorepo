export function WebsiteIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox="0 0 27 27"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 6A11 11 0 0 0 8 2L4 6m9-5-3 5m4-5 2 5m6 14a11 11 0 0 1-14 4l-4-4m9 5-3-5m4 5 2-5M1 11l1 5 2-5 2 5 1-5m12 0 1 5 2-5 2 5 1-5m-15 0 1 5 2-5 2 5 1-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}
