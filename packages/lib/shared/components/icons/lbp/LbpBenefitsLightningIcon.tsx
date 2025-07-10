import { SVGProps, forwardRef } from 'react'
import { useColorMode } from '@chakra-ui/react'

interface LbpBenefitsLightningIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export const LbpBenefitsLightningIcon = forwardRef<SVGSVGElement, LbpBenefitsLightningIconProps>(
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
        <g clipPath="url(#clip0_77_335-lbp2)">
          <mask
            height="69"
            id="mask0_77_335-lbp2"
            maskUnits="userSpaceOnUse"
            style={{ maskType: 'alpha' }}
            width="69"
            x="1"
            y="-1"
          >
            <path
              d="M57 32a2 2 0 0 0-1-1l-15-6 4-19a2 2 0 0 0-4-2L12 36a2 2 0 0 0 1 3l15 6-4 19a2 2 0 0 0 4 2l29-32a2 2 0 0 0 0-2ZM30 57l2-13a2 2 0 0 0-1-3l-14-5 22-24-2 14a2 2 0 0 0 1 3l14 5-22 23Z"
              fill="#000"
            />
          </mask>
          <g mask="url(#mask0_77_335-lbp2)">
            <g className="gold-texture">
              <path d="M-3.078-27.202h105.674V93.773H-3.078z" fill="url(#pattern0_77_335-lbp2)" />
            </g>
          </g>
        </g>
        <defs>
          <clipPath id="clip0_77_335-lbp2">
            <path d="M0 0h70v70H0z" fill="#fff" />
          </clipPath>
          <pattern
            height="1"
            id="pattern0_77_335-lbp2"
            patternContentUnits="objectBoundingBox"
            width="1"
          >
            <use transform="matrix(.00365 0 0 .00318 -.01 0)" xlinkHref="#image0_77_335-lbp2" />
          </pattern>
          <image
            height="314"
            href={
              colorMode === 'dark'
                ? '/images/textures/gold-texture-dark.jpg'
                : '/images/textures/gold-texture.jpg'
            }
            id="image0_77_335-lbp2"
            preserveAspectRatio="none"
            width="280"
          />
        </defs>
      </svg>
    )
  }
)

LbpBenefitsLightningIcon.displayName = 'LbpBenefitsLightningIcon'
