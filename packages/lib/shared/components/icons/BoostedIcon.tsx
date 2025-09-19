import { useColorModeValue } from '@chakra-ui/react'
import { SVGProps } from 'react'

export function BoostedIcon({ size = 24, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  const stopColor1 = useColorModeValue('#FFFFFF', '#FCFCFD')
  const stopColor2 = useColorModeValue('#DFCCB9', '#A0AEC0')
  return (
    <svg
      {...props}
      fill="none"
      height={size}
      viewBox="0 0 20 20"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="url(#xyza)" height="100%" rx="10" width="100%" />
      <path
        d="M11.2 3.105c1.05 0 1.932.143 2.646.425.718.283 1.26.682 1.623 1.199.368.516.551 1.124.551 1.824 0 .507-.112.97-.336 1.386-.22.418-.53.768-.93 1.051-.399.279-.865.472-1.4.58v.002l-4.029.058.454-3.635-4.543 5.452h4.09l-.455 3.635 4.483-5.384v.006a3.459 3.459 0 0 1 1.617.451c.484.274.87.653 1.157 1.138.287.48.432 1.046.432 1.696 0 .754-.198 1.425-.593 2.013-.39.588-.947 1.05-1.67 1.388-.723.336-1.584.505-2.585.505h-6.49V3.105H11.2Z"
        fill="#2D3748"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="xyza"
          x1="16.072"
          x2="3.797"
          y1="2.05"
          y2="17.527"
        >
          <stop stopColor={stopColor1} />
          <stop offset="1" stopColor={stopColor2} />
        </linearGradient>
      </defs>
    </svg>
  )
}
