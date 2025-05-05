import { SVGProps, forwardRef } from 'react'
import { useColorMode } from '@chakra-ui/react'

/* eslint-disable max-len */
interface VebalBenefitsSparklesIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export const VebalBenefitsSparklesIcon = forwardRef<SVGSVGElement, VebalBenefitsSparklesIconProps>(
  ({ size = 38, ...props }, ref) => {
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
        <g clipPath="url(#a)">
          <mask
            height="65"
            id="e"
            maskUnits="userSpaceOnUse"
            style={{ maskType: 'alpha' }}
            width="64"
            x="3"
            y="1"
          >
            <path
              d="M35.317 37.872c-4.034 1.42-7.204 4.631-8.606 8.717l-2.615 7.622a.28.28 0 0 1-.265.192.28.28 0 0 1-.264-.192l-2.616-7.622c-1.4-4.086-4.571-7.297-8.605-8.717L4.82 35.225a.283.283 0 0 1-.188-.267c0-.12.075-.228.188-.267l7.526-2.648c4.034-1.42 7.204-4.63 8.605-8.716l2.616-7.623a.28.28 0 0 1 .264-.192.28.28 0 0 1 .265.192l2.615 7.623c1.402 4.085 4.572 7.296 8.606 8.716l7.526 2.648c.113.04.188.146.188.267 0 .12-.075.227-.188.267l-7.526 2.647Z"
              fill="url(#d)"
            />
            <path
              d="M59.126 20.751a10.116 10.116 0 0 0-6.196 6.276l-1.883 5.488a.201.201 0 0 1-.19.14.201.201 0 0 1-.191-.14l-1.883-5.488a10.116 10.116 0 0 0-6.197-6.276l-5.418-1.906a.203.203 0 0 1-.135-.192c0-.087.054-.164.135-.193l5.418-1.906a10.116 10.116 0 0 0 6.197-6.276l1.883-5.488a.201.201 0 0 1 .19-.14c.087 0 .164.057.191.14l1.883 5.488a10.116 10.116 0 0 0 6.196 6.276l5.419 1.906c.08.029.135.106.135.193a.203.203 0 0 1-.135.192l-5.419 1.906Z"
              fill="url(#d)"
            />
            <path
              d="M55.636 52.182a8.093 8.093 0 0 0-4.956 5.02l-1.507 4.391a.161.161 0 0 1-.154.117.161.161 0 0 1-.154-.117l-1.503-4.39a8.093 8.093 0 0 0-4.96-5.02l-4.333-1.526a.163.163 0 0 1-.108-.154c0-.069.043-.13.108-.154l4.333-1.524a8.093 8.093 0 0 0 4.96-5.021l1.503-4.39a.161.161 0 0 1 .154-.117c.071 0 .134.047.154.117l1.507 4.39a8.093 8.093 0 0 0 4.956 5.02l4.337 1.526a.163.163 0 0 1 .108.153c0 .07-.044.132-.108.154l-4.337 1.525Z"
              fill="url(#d)"
            />
          </mask>
          <g mask="url(#e)">
            <g className="gold-texture">
              <path d="M5.25-17.521h91.757V87.522H5.25z" fill="url(#f)" />
            </g>
          </g>
        </g>
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id="b"
            x1="34.656"
            x2="34.656"
            y1="4.65"
            y2="61.71"
          >
            <stop stopColor="#EFB473" />
            <stop offset="1" stopColor="#F48975" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id="c"
            x1="34.656"
            x2="34.656"
            y1="4.65"
            y2="61.71"
          >
            <stop stopColor="#EFB473" />
            <stop offset="1" stopColor="#F48975" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id="d"
            x1="34.656"
            x2="34.656"
            y1="4.65"
            y2="61.71"
          >
            <stop stopColor="#EFB473" />
            <stop offset="1" stopColor="#F48975" />
          </linearGradient>
          <clipPath id="a">
            <path d="M0 0h70v70H0z" fill="#fff" />
          </clipPath>
          <pattern height="1" id="f" patternContentUnits="objectBoundingBox" width="1">
            <use transform="matrix(.00365 0 0 .00318 -.01 0)" xlinkHref="#g" />
          </pattern>
          <image
            height="314"
            href={
              colorMode === 'dark'
                ? '/images/textures/gold-texture-dark.jpg'
                : '/images/textures/gold-texture.jpg'
            }
            id="g"
            preserveAspectRatio="none"
            width="280"
          />
        </defs>
      </svg>
    )
  }
)

VebalBenefitsSparklesIcon.displayName = 'VebalBenefitsSparklesIcon'
