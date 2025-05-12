import { SVGProps, forwardRef } from 'react'
import { useColorMode } from '@chakra-ui/react'

interface VebalBenefitsShareIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export const VebalBenefitsShareIcon = forwardRef<SVGSVGElement, VebalBenefitsShareIconProps>(
  ({ size = 44, ...props }, ref) => {
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
        <g clipPath="url(#clip0_77_361)">
          <mask
            height="71"
            id="mask0_77_361"
            maskUnits="userSpaceOnUse"
            style={{ maskType: 'alpha' }}
            width="70"
            x="0"
            y="-4"
          >
            <path
              d="M64.425 36.856a6.433 6.433 0 0 0-5.593-1.114l-11.017 2.534a7.371 7.371 0 0 0-7.176-9.072H27.457a8.378 8.378 0 0 0-5.959 2.467l-5.956 5.96H7.987a4.213 4.213 0 0 0-4.213 4.212v10.533a4.213 4.213 0 0 0 4.213 4.214h27.386c.172 0 .343-.022.51-.064l16.853-4.213c.108-.025.212-.06.313-.105l10.236-4.355.116-.053a6.477 6.477 0 0 0 1.034-10.944h-.01ZM7.987 41.843h6.32v10.533h-6.32V41.844Zm53.568 2.162-10.007 4.261-16.439 4.11H18.52V40.61l5.959-5.957a4.178 4.178 0 0 1 2.978-1.235H40.64a3.16 3.16 0 0 1 0 6.32h-7.373a2.107 2.107 0 1 0 0 4.213h8.426c.159 0 .317-.018.472-.053l17.642-4.057.082-.021a2.264 2.264 0 0 1 1.659 4.186h.008ZM46.959 24.991c.52 0 1.04-.042 1.553-.127a9.48 9.48 0 1 0 7.431-12.376 9.48 9.48 0 1 0-8.984 12.503Zm15.8-3.16a5.266 5.266 0 1 1-10.533 0 5.266 5.266 0 0 1 10.532 0Zm-15.8-11.586a5.267 5.267 0 0 1 5.069 3.847 9.48 9.48 0 0 0-3.95 6.565 5.267 5.267 0 1 1-1.12-10.412Z"
              fill="#000"
            />
          </mask>
          <g mask="url(#mask0_77_361)">
            {/* Wrap the gold background path */}
            <g className="gold-texture">
              <path d="M-1.25-27.52h99.963V86.917H-1.25z" fill="url(#pattern0_77_361)" />
            </g>
          </g>
        </g>
        <defs>
          <clipPath id="clip0_77_361">
            <path d="M0 0h70v70H0z" fill="#fff" />
          </clipPath>
          <pattern
            height="1"
            id="pattern0_77_361"
            patternContentUnits="objectBoundingBox"
            width="1"
          >
            <use transform="matrix(.00365 0 0 .00318 -.01 0)" xlinkHref="#image0_77_361" />
          </pattern>
          <image
            height="314"
            href={
              colorMode === 'dark'
                ? '/images/textures/gold-texture-dark.jpg'
                : '/images/textures/gold-texture.jpg'
            }
            id="image0_77_361"
            preserveAspectRatio="none"
            width="280"
          />
        </defs>
      </svg>
    )
  }
)

VebalBenefitsShareIcon.displayName = 'VebalBenefitsShareIcon'
