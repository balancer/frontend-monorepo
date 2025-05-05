import { useEffect, useRef, ReactNode, cloneElement, isValidElement } from 'react'
import { Box } from '@chakra-ui/react'
import { useScroll, useTransform, useSpring } from 'framer-motion'

export function SparkleIconWrapper({
  children,
  rotationRange = 720,
  size = 44,
}: {
  children: ReactNode
  rotationRange?: number
  size?: number
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start end', 'end start'],
  })

  const rotate = useSpring(useTransform(scrollYProgress, [0, 1], [0, rotationRange]), {
    stiffness: 80,
    damping: 20,
  })

  useEffect(() => {
    const svgElement = svgRef.current
    if (!svgElement) {
      console.warn('SparkleIconWrapper: SVG ref not found.')
      return
    }

    const goldGroup = svgElement.querySelector('.gold-texture') as SVGGElement | null
    if (!goldGroup) {
      console.warn('SparkleIconWrapper: .gold-texture group not found in SVG.')
      return
    }

    const goldGroupElement = goldGroup as SVGGElement
    goldGroupElement.style.transformOrigin = 'center center'

    const unsubscribe = rotate.onChange(latestRotateValue => {
      requestAnimationFrame(() => {
        goldGroupElement.style.transform = `scale(1.2) rotate(${latestRotateValue}deg)`
      })
    })

    return () => unsubscribe()
  }, [rotate])

  const childWithRef = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, { ref: svgRef })
    : children

  return (
    <Box
      display="inline-block"
      height={size}
      position="relative"
      ref={wrapperRef}
      sx={{
        '> svg': {
          display: 'block',
          width: '100%',
          height: '100%',
        },
      }}
      width={size}
    >
      {childWithRef}
    </Box>
  )
}
