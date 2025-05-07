import { SVGProps } from 'react'

 
export function PromoVThreeIcon({
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
      <path
        d="M26.12 16.482v-7.42h18.102v8.426c0 2.64-.851 5.072-2.258 6.916 1.407 1.844 2.258 4.276 2.258 6.916v9.18H26.12v-7.42h11.55v-1.76c0-1.76-1.258-3.227-2.85-3.227h-6.072v-7.42h6.073c1.591 0 2.85-1.425 2.85-3.185v-1.006H26.12ZM17.374 32.787V9.063h6.26V40.5h-3.148c-12.978 0-16.177-9.808-16.707-24.018v-7.42h6.224v5.03c0 8.384.014 16.658 7.37 18.695Z"
        fill="currentColor"
        // style={{ mixBlendMode: 'reset' }}
      />
    </svg>
  )
}
