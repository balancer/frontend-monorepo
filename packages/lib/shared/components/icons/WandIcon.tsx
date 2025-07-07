import { SVGProps } from 'react'

export function WandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 17 16" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M1 3a1 1 0 0 1 1-1h1V1a1 1 0 0 1 1 0v1h2a1 1 0 0 1 0 2H4v1a1 1 0 0 1-1 0V4H2a1 1 0 0 1-1-1Zm11 10h-1v-1a1 1 0 0 0-1 0v1H9a1 1 0 1 0 0 1h1v1a1 1 0 1 0 1 0v-1h1a1 1 0 1 0 0-1Zm4-4h-1V8a1 1 0 0 0-1 0v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 1 0v-1h1a1 1 0 1 0 0-2Zm-1-5L4 15a1 1 0 0 1-2 0l-2-1a1 1 0 0 1 0-2L11 1a1 1 0 0 1 2 0l2 1a1 1 0 0 1 0 2Zm-5 3L9 5l-8 8 2 1 7-7Zm4-4-2-1-2 2 1 2 3-3Z"
        fill="#2D3748"
      />
    </svg>
  )
}
