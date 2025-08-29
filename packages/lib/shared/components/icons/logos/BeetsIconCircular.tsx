export function BeetsIconCircular({ size = 28 }: { size?: number }) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox="0 0 29 29"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14.5" cy="14.5" fill="#fff" r="14" />
      <path
        d="M14.5 6.202A7.298 7.298 0 0 0 7.202 13.5v7.298h14.596V13.5A7.298 7.298 0 0 0 14.5 6.202Z"
        fill="#1A1A1A"
      />
      <path
        d="M17.237 19.467a1.825 1.825 0 1 0 0-3.65 1.825 1.825 0 0 0 0 3.65ZM11.763 19.467a1.825 1.825 0 1 0 0-3.65 1.825 1.825 0 0 0 0 3.65Z"
        fill="#fff"
      />
      <path d="M17.237 18.212a.57.57 0 1 0 0-1.14.57.57 0 0 0 0 1.14Z" fill="#05D690" />
      <path d="M11.763 18.212a.57.57 0 1 0 0-1.14.57.57 0 0 0 0 1.14Z" fill="red" />
    </svg>
  )
}
