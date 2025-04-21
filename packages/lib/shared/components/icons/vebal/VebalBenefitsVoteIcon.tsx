import { SVGProps } from 'react'
import { useColorMode } from '@chakra-ui/react'

/* eslint-disable max-len */
export function VebalBenefitsVoteIcon({
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
      <mask
        height="51"
        id="a"
        maskUnits="userSpaceOnUse"
        style={{ maskType: 'alpha' }}
        width="51"
        x="9"
        y="8"
      >
        <path
          d="m23.888 31.526 8.333-18.75a6.25 6.25 0 0 1 6.25 6.25v8.333h11.792a4.166 4.166 0 0 1 4.167 4.792L51.555 50.9a4.167 4.167 0 0 1-4.167 3.541h-23.5m0-22.916v22.917m0-22.917h-6.25a4.167 4.167 0 0 0-4.167 4.167v14.583a4.167 4.167 0 0 0 4.167 4.166h6.25"
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4.167"
        />
      </mask>
      <g mask="url(#a)">
        <path d="M10.862 3.25h55.469v63.5H10.862z" fill="url(#b)" />
      </g>
      <defs>
        <pattern height="1" id="b" patternContentUnits="objectBoundingBox" width="1">
          <use transform="matrix(.00365 0 0 .00318 -.01 0)" xlinkHref="#c" />
        </pattern>
        <image
          height="314"
          href={
            colorMode === 'dark'
              ? '/images/textures/gold-texture-dark.jpg'
              : '/images/textures/gold-texture.jpg'
          }
          id="c"
          preserveAspectRatio="none"
          width="280"
        />
      </defs>
    </svg>
  )
}
