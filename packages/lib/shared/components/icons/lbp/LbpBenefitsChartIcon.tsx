import { SVGProps, forwardRef } from 'react'
import { useColorMode } from '@chakra-ui/react'

interface LbpBenefitsChartIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export const LbpBenefitsChartIcon = forwardRef<SVGSVGElement, LbpBenefitsChartIconProps>(
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
        <g clipPath="url(#clip0_77_335-lbp1)">
          <mask
            height="69"
            id="mask0_77_335-lbp1"
            maskUnits="userSpaceOnUse"
            style={{ maskType: 'alpha' }}
            width="69"
            x="1"
            y="-1"
          >
            <path
              d="M65 16v17a2 2 0 1 1-5 0V21L38 43a2 2 0 0 1-3 0l-10-9L7 52a2 2 0 0 1-3-3l20-20a2 2 0 0 1 3 0l9 10 21-21H45a2 2 0 0 1 0-5h17a2 2 0 0 1 3 3Z"
              fill="#000"
            />
          </mask>
          <g mask="url(#mask0_77_335-lbp1)">
            <g className="gold-texture">
              <path d="M-3.078-27.202h105.674V93.773H-3.078z" fill="url(#pattern0_77_335-lbp1)" />
            </g>
          </g>
        </g>
        <defs>
          <clipPath id="clip0_77_335-lbp1">
            <path d="M0 0h70v70H0z" fill="#fff" />
          </clipPath>
          <pattern
            height="1"
            id="pattern0_77_335-lbp1"
            patternContentUnits="objectBoundingBox"
            width="1"
          >
            <use transform="matrix(.00365 0 0 .00318 -.01 0)" xlinkHref="#image0_77_335-lbp1" />
          </pattern>
          <image
            height="314"
            href={
              colorMode === 'dark'
                ? '/images/textures/gold-texture-dark.jpg'
                : '/images/textures/gold-texture.jpg'
            }
            id="image0_77_335-lbp1"
            preserveAspectRatio="none"
            width="280"
          />
        </defs>
      </svg>
    )
  }
)

LbpBenefitsChartIcon.displayName = 'LbpBenefitsChartIcon'
