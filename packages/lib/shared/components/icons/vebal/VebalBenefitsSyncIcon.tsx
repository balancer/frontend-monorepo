import { SVGProps, forwardRef, useId } from 'react'
import { useColorMode } from '@chakra-ui/react'

export interface VebalBenefitsSyncIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export const VebalBenefitsSyncIcon = forwardRef<SVGSVGElement, VebalBenefitsSyncIconProps>(
  ({ size = 24, ...props }, ref) => {
    const { colorMode } = useColorMode()
    const id = useId()
    const clipPathId = `sync-clip-${id}`
    const maskId = `sync-mask-${id}`
    const gradientId = `sync-gradient-${id}`
    const patternId = `sync-pattern-${id}`
    const imageId = `sync-image-${id}`

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
        <g clipPath={`url(#${clipPathId})`}>
          <mask
            height="69"
            id={maskId}
            maskUnits="userSpaceOnUse"
            style={{ maskType: 'alpha' }}
            width="69"
            x="1"
            y="-1"
          >
            <path
              d="M60 13v12a2 2 0 0 1-2 2H46a2 2 0 1 1 0-4h7l-4-4c-4-3-9-6-14-6-6 0-11 2-15 6a2 2 0 0 1-2-3 24 24 0 0 1 34 0l4 4v-7a2 2 0 1 1 4 0ZM50 47a20 20 0 0 1-28 0l-4-4h7a2 2 0 0 0 0-4H13a2 2 0 0 0-2 2v13a2 2 0 1 0 4 0v-8l4 4c4 5 10 7 17 7 6 0 13-2 17-7a2 2 0 0 0-3-3Z"
              fill={`url(#${gradientId})`}
            />
          </mask>
          <g mask={`url(#${maskId})`}>
            <g className="gold-texture">
              <path d="M5.25-17.521h91.757V87.522H5.25z" fill={`url(#${patternId})`} />
            </g>
          </g>
        </g>
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={gradientId}
            x1="34.656"
            x2="34.656"
            y1="4.65"
            y2="61.71"
          >
            <stop stopColor="#EFB473" />
            <stop offset="1" stopColor="#F48975" />
          </linearGradient>
          <clipPath id={clipPathId}>
            <path d="M0 0h70v70H0z" fill="#fff" />
          </clipPath>
          <pattern height="1" id={patternId} patternContentUnits="objectBoundingBox" width="1">
            <use href={`#${imageId}`} transform="matrix(.00365 0 0 .00318 -.01 0)" />
          </pattern>
          <image
            height="314"
            href={
              colorMode === 'dark'
                ? '/images/textures/gold-texture-dark.jpg'
                : '/images/textures/gold-texture.jpg'
            }
            id={imageId}
            preserveAspectRatio="none"
            width="280"
          />
        </defs>
      </svg>
    )
  }
)

VebalBenefitsSyncIcon.displayName = 'VebalBenefitsSyncIcon'
