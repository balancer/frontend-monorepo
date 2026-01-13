import { SVGProps, forwardRef } from 'react'
import { useColorMode } from '@chakra-ui/react'

interface LbpBenefitsHookIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export const LbpBenefitsHookIcon = forwardRef<SVGSVGElement, LbpBenefitsHookIconProps>(
  ({ size = 42, ...props }, ref) => {
    const { colorMode } = useColorMode()

    return (
      <svg
        fill="none"
        height={size}
        ref={ref}
        viewBox="0 0 70 70"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <g clipPath="url(#clip0_77_335-hook)">
          <mask
            height="69"
            id="mask0_77_335-hook"
            maskUnits="userSpaceOnUse"
            style={{ maskType: 'alpha' }}
            width="69"
            x="1"
            y="-1"
          >
            <path
              d="M46.7 26.3v17.5a14.6 14.6 0 0 1-29.2 0V32l8.75 8.75"
              fill="none"
              stroke="#000"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
            <circle cx="46.7" cy="20.4" fill="none" r="5.8" stroke="#000" strokeWidth="5" />
            <path
              d="M46.7 14.6V8.75"
              fill="none"
              stroke="#000"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
          </mask>
          <g mask="url(#mask0_77_335-hook)">
            <g className="gold-texture">
              <path d="M-3.078-27.202h105.674V93.773H-3.078z" fill="url(#pattern0_77_335-hook)" />
            </g>
          </g>
        </g>
        <defs>
          <clipPath id="clip0_77_335-hook">
            <path d="M0 0h70v70H0z" fill="#fff" />
          </clipPath>
          <pattern
            height="1"
            id="pattern0_77_335-hook"
            patternContentUnits="objectBoundingBox"
            width="1"
          >
            <use transform="matrix(.00365 0 0 .00318 -.01 0)" xlinkHref="#image0_77_335-hook" />
          </pattern>
          <image
            height="314"
            href={
              colorMode === 'dark'
                ? '/images/textures/gold-texture-dark.jpg'
                : '/images/textures/gold-texture.jpg'
            }
            id="image0_77_335-hook"
            preserveAspectRatio="none"
            width="280"
          />
        </defs>
      </svg>
    )
  }
)

LbpBenefitsHookIcon.displayName = 'LbpBenefitsHookIcon'
