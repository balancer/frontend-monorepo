/** @paper-design/shaders-react@0.0.60 */
import { LiquidMetal as LiquidMetal1 } from '@paper-design/shaders-react'

type LiquidMetalProps = {
  size?: number | string
}

export default function LiquidMetal({ size = '800px' }: LiquidMetalProps) {
  const shaderSize = typeof size === 'number' ? `${size}px` : size

  return (
    <LiquidMetal1
      angle={70}
      colorBack="#00000000"
      colorTint="#FFFFFF"
      contour={0.4}
      distortion={1}
      frame={198398.64900010484}
      image="/images/logos/logo-balancer.png"
      repetition={2}
      rotation={0}
      scale={0.6}
      shape="diamond"
      shiftBlue={0.1}
      shiftRed={0.1}
      softness={0}
      speed={0.07}
      style={{
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))',
        height: shaderSize,
        opacity: '100%',
        width: shaderSize,
      }}
    />
  )
}
