import { SVGProps, forwardRef } from 'react'
import { useColorMode } from '@chakra-ui/react'

interface LbpBenefitsScalesIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export const LbpBenefitsScalesIcon = forwardRef<SVGSVGElement, LbpBenefitsScalesIconProps>(
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
        <g clipPath="url(#clip0_77_335-lbp)">
          <mask
            height="69"
            id="mask0_77_335-lbp"
            maskUnits="userSpaceOnUse"
            style={{ maskType: 'alpha' }}
            width="69"
            x="1"
            y="-1"
          >
            <path
              d="m66 34-9-22a2 2 0 0 0-2-2l-18 4V8a2 2 0 1 0-4 0v7l-19 5a2 2 0 0 0-1 1L4 43l-1 1c0 7 7 9 12 9 4 0 11-2 11-9v-1l-8-20 15-3v36h-5a2 2 0 1 0 0 4h14a2 2 0 0 0 0-4h-5V19l15-3-8 18v1c0 7 7 9 11 9 5 0 12-2 12-9l-1-1ZM15 49c-2 0-7-1-7-4l7-17 6 17c0 3-4 4-6 4Zm40-9c-2 0-6-1-6-4l6-17 7 17c0 3-5 4-7 4Z"
              fill="#000"
            />
          </mask>
          <g mask="url(#mask0_77_335-lbp)">
            <g className="gold-texture">
              <path d="M-3.078-27.202h105.674V93.773H-3.078z" fill="url(#pattern0_77_335-lbp)" />
            </g>
          </g>
        </g>
        <defs>
          <clipPath id="clip0_77_335-lbp">
            <path d="M0 0h70v70H0z" fill="#fff" />
          </clipPath>
          <pattern
            height="1"
            id="pattern0_77_335-lbp"
            patternContentUnits="objectBoundingBox"
            width="1"
          >
            <use transform="matrix(.00365 0 0 .00318 -.01 0)" xlinkHref="#image0_77_335-lbp" />
          </pattern>
          <image
            height="314"
            href={
              colorMode === 'dark'
                ? '/images/textures/gold-texture-dark.jpg'
                : '/images/textures/gold-texture.jpg'
            }
            id="image0_77_335-lbp"
            preserveAspectRatio="none"
            width="280"
          />
        </defs>
      </svg>
    )
  }
)

LbpBenefitsScalesIcon.displayName = 'LbpBenefitsScalesIcon'
