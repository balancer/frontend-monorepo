/* eslint-disable max-len */
'use client'

import { Text, Center, VStack, useColorModeValue, Button } from '@chakra-ui/react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'react-feather'
import NextLink from 'next/link'
import { Title } from './Title'

const backgroundImages = ['zenbg-1.webp', 'zenbg-4.webp', 'zenbg-2.webp', 'zenbg-3.webp']

// function AnimatedCircle({
//   radius,
//   duration,
//   delay,
//   size,
//   color,
//   isPaused,
//   onHover,
//   onHoverEnd,
// }: {
//   radius: number
//   duration: number
//   delay: number
//   size: number
//   color: string
//   isPaused: boolean
//   onHover: () => void
//   onHoverEnd: () => void
// }) {
//   const circleRef = useRef<HTMLDivElement>(null)
//   const [lastX, setLastX] = useState(0)
//   const [lastY, setLastY] = useState(0)
//   const [hasStarted, setHasStarted] = useState(false)
//   const controls = useAnimationControls()

//   useEffect(() => {
//     if (isPaused) {
//       setLastX(circleRef.current?.getBoundingClientRect().x ?? 0)
//       setLastY(circleRef.current?.getBoundingClientRect().y ?? 0)
//       controls.stop()
//     } else if (hasStarted) {
//       controls.start({
//         x: lastX,
//         y: lastY,
//       })
//     } else {
//       controls.start({
//         opacity: 1,
//         x: Array.from({ length: 360 }, (_, i) => radius * Math.cos(((i + 90) * Math.PI) / 180)),
//         y: Array.from({ length: 360 }, (_, i) => radius * Math.sin(((i + 90) * Math.PI) / 180)),
//       })
//       setHasStarted(true)
//     }
//   }, [isPaused, controls])

//   return (
//     <motion.div
//       animate={{
//         opacity: 1,
//         x: Array.from({ length: 360 }, (_, i) => radius * Math.cos(((i + 90) * Math.PI) / 180)),
//         y: Array.from({ length: 360 }, (_, i) => radius * Math.sin(((i + 90) * Math.PI) / 180)),
//       }}
//       initial={{ opacity: 0 }}
//       onHoverEnd={onHoverEnd}
//       onHoverStart={onHover}
//       ref={circleRef}
//       style={{
//         position: 'absolute',
//         width: size,
//         height: size,
//         borderRadius: '50%',
//         backgroundColor: color,
//         cursor: 'pointer',
//         animationPlayState: isPaused ? 'paused' : 'running',
//       }}
//       transition={{
//         opacity: { duration: 1, delay },
//         x: {
//           duration,
//           repeat: Infinity,
//           ease: 'linear',
//           delay,
//           repeatType: 'loop',
//         },
//         y: {
//           duration,
//           repeat: Infinity,
//           ease: 'linear',
//           delay,
//           repeatType: 'loop',
//         },
//       }}
//     />
//   )
// }

function BalancerLogo() {
  const iconColor = useColorModeValue('#2D3239', '#E5D3BE')

  return (
    <motion.div
      style={{
        filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.3))',
        backdropFilter: 'blur(4px)',
        padding: '16px',
        borderRadius: '50%',
      }}
    >
      <motion.svg
        fill="none"
        height="128"
        viewBox="0 0 32 32"
        width="128"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bottom rock */}
        <motion.path
          animate={{ y: [0, -1, 0] }}
          d="M26.106 20.939c0 1.924-4.525 3.482-10.105 3.482S5.896 22.862 5.896 20.939c0-1.924 4.525-3.482 10.105-3.482s10.105 1.558 10.105 3.482z"
          fill={iconColor}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 0.2,
            delay: 1,
          }}
        />
        {/* Middle rock */}
        <motion.path
          animate={{ y: [0, -1.5, 0] }}
          d="M24.107 14.718c0 1.529-3.63 2.768-8.106 2.768-4.477 0-8.106-1.24-8.106-2.768 0-1.529 3.63-2.768 8.106-2.768 4.476 0 8.106 1.24 8.106 2.768z"
          fill={iconColor}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 0.2,
            delay: 1,
          }}
        />
        {/* Top rock */}
        <motion.path
          animate={{ y: [0, -2, 0] }}
          d="M22.108 9.676c0 1.157-2.718 2.095-6.07 2.095-3.353 0-6.07-.938-6.07-2.095 0-1.158 2.717-2.096 6.07-2.096 3.352 0 6.07.938 6.07 2.096z"
          fill={iconColor}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 0.2,
            delay: 1,
          }}
        />
      </motion.svg>
    </motion.div>
  )
}

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  // const [isAnimationPaused, setIsAnimationPaused] = useState(false)
  const hiddenRef = useRef<HTMLSpanElement>(null)

  // const handleHover = useCallback(() => {
  //   setIsAnimationPaused(true)
  // }, [])

  // const handleHoverEnd = useCallback(() => {
  //   setIsAnimationPaused(false)
  // }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev === backgroundImages.length - 1 ? 0 : prev + 1))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Noise>
      <motion.div
        animate={{ opacity: 0.8 }}
        initial={{ opacity: 0.2 }}
        style={{
          backgroundImage: `url(/images/bgs/${backgroundImages[currentImageIndex]})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          height: '100vh',
          minHeight: '600px',
          transition: 'background-image 3s ease-in-out',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
        transition={{ duration: 0.5 }}
      />
      {/* Rotating rocks in case we want them */}
      {/* <div
        onMouseLeave={() => setIsAnimationPaused(false)}
        style={{ position: 'fixed', left: '50%', top: '50%', zIndex: 1 }}
      >
        <AnimatedCircle
          color="blue"
          delay={0}
          duration={50}
          isPaused={isAnimationPaused}
          onHover={handleHover}
          onHoverEnd={handleHoverEnd}
          radius={500}
          size={100}
        />
        <AnimatedCircle
          color="red"
          delay={4}
          duration={50}
          isPaused={isAnimationPaused}
          onHover={handleHover}
          onHoverEnd={handleHoverEnd}
          radius={550}
          size={80}
        />
        <AnimatedCircle
          color="green"
          delay={8}
          duration={50}
          isPaused={isAnimationPaused}
          onHover={handleHover}
          onHoverEnd={handleHoverEnd}
          radius={600}
          size={60}
        />
      </div> */}
      <Center h="100vh" maxW="full" minHeight="600px" position="relative">
        <motion.div
          animate={{ opacity: 0.4 }}
          initial={{ opacity: 0 }}
          style={{
            backgroundImage: `url(/images/graphics/zen-writing-3.webp)`,
            backgroundPosition: 'center',
            backgroundSize: '400px',
            backgroundRepeat: 'no-repeat',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          transition={{ duration: 5 }}
        />
        <VStack maxW="full" mt="-100px" spacing="lg">
          <motion.div
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <BalancerLogo />
          </motion.div>
          <VStack maxW="full" px="sm" spacing="md">
            <Title />
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <Text
                color="font.secondary"
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="thin"
                textAlign="center"
              >
                V3 consolidates, re-engineers and builds on previous innovations. <br />
                Code less, build more.
              </Text>
            </motion.div>
          </VStack>

          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{
              delay: 0.5,
              duration: 2,
              type: 'spring',
              stiffness: 100,
              damping: 10,
              mass: 1,
            }}
          >
            <Button
              as={NextLink}
              href="https://docs-v3.balancer.fi"
              mt="xl"
              rightIcon={<ArrowUpRight />}
              size="lg"
              target="_blank"
              variant="secondary"
            >
              Get Started
            </Button>
          </motion.div>
        </VStack>
      </Center>
      <span
        ref={hiddenRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          fontSize: '3xl', // Match your heading size
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
        }}
      />
    </Noise>
  )
}
