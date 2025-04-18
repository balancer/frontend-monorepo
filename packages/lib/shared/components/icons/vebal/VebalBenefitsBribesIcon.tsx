import { SVGProps } from 'react'
import { useColorMode } from '@chakra-ui/react'

/* eslint-disable max-len */
export function VebalBenefitsBribesIcon({
  size = 24,
  ...props
}: { size?: number } & SVGProps<SVGSVGElement>) {
  const { colorMode } = useColorMode()

  return (
    <svg
      height={size}
      width={size}
      {...props}
      fill="none"
      viewBox="0 0 70 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_77_335)">
        <mask
          height="69"
          id="mask0_77_335"
          maskUnits="userSpaceOnUse"
          style={{ maskType: 'alpha' }}
          width="69"
          x="1"
          y="-1"
        >
          <path
            d="M64.52 37.041a6.356 6.356 0 0 0-4.857-1.245c4.902-4.949 7.382-9.87 7.382-14.693 0-6.91-5.557-12.53-12.388-12.53a12.42 12.42 0 0 0-9.538 4.373 12.42 12.42 0 0 0-9.538-4.373c-6.831 0-12.389 5.62-12.389 12.53 0 2.871.846 5.662 2.626 8.614a8.32 8.32 0 0 0-3.85 2.192l-5.904 5.9h-7.49a4.177 4.177 0 0 0-4.176 4.176v10.441a4.176 4.176 0 0 0 4.177 4.176h27.147c.17 0 .34-.02.506-.062l16.706-4.177a1.8 1.8 0 0 0 .31-.104l10.147-4.317.114-.053a6.42 6.42 0 0 0 1.026-10.848h-.01ZM35.58 12.75a8.132 8.132 0 0 1 7.607 4.96 2.089 2.089 0 0 0 3.863 0 8.131 8.131 0 0 1 7.607-4.96c4.45 0 8.212 3.824 8.212 8.353 0 5.092-4.122 10.853-11.919 16.68l-2.895.665a7.309 7.309 0 0 0-7.113-8.992H30.68c-2.253-3.039-3.31-5.712-3.31-8.353 0-4.529 3.761-8.353 8.212-8.353ZM8.576 41.985h6.264v10.441H8.575V41.985Zm53.1 2.143-9.918 4.224-16.296 4.074H19.016V40.761l5.907-5.905a4.139 4.139 0 0 1 2.952-1.224h13.067a3.132 3.132 0 0 1 0 6.265h-7.309a2.088 2.088 0 0 0 0 4.176h8.353c.158 0 .314-.018.468-.052l17.489-4.022.08-.021a2.245 2.245 0 0 1 1.645 4.15h.008Z"
            fill="#000"
          />
        </mask>
        <g mask="url(#mask0_77_335)">
          <path d="M-3.078-27.202h105.674V93.773H-3.078z" fill="url(#pattern0_77_335)" />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_77_335">
          <path d="M0 0h70v70H0z" fill="#fff" />
        </clipPath>
        <pattern height="1" id="pattern0_77_335" patternContentUnits="objectBoundingBox" width="1">
          <use transform="matrix(.00365 0 0 .00318 -.01 0)" xlinkHref="#image0_77_335" />
        </pattern>
        <image
          height="314"
          href={
            colorMode === 'dark'
              ? '/images/textures/gold-texture-dark.jpg'
              : '/images/textures/gold-texture.jpg'
          }
          id="image0_77_335"
          preserveAspectRatio="none"
          width="280"
        />
      </defs>
    </svg>
  )
}
