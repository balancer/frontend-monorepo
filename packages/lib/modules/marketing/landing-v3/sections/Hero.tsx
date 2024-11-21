'use client'

import { Text, Center, Heading, VStack, useColorModeValue, Button } from '@chakra-ui/react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'react-feather'
import NextLink from 'next/link'

const backgroundImages = ['zenbg-1.webp', 'zenbg-2.webp', 'zenbg-3.webp', 'zenbg-4.webp']
const buildWords = ['AMMs', 'custom pools', 'hooks', 'DEXs']

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
          }}
        />
      </motion.svg>
    </motion.div>
  )
}

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [width, setWidth] = useState(0)
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev === backgroundImages.length - 1 ? 0 : prev + 1))
    }, 10000) // Change image every 10 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWordIndex(prev => (prev === buildWords.length - 1 ? 0 : prev + 1))
    }, 3000) // Change word every 3 seconds

    return () => clearInterval(wordInterval)
  }, [])

  // Update width when word changes
  useEffect(() => {
    if (textRef.current) {
      const newWidth = textRef.current.offsetWidth
      console.log('Measured width for word:', buildWords[currentWordIndex + 1], newWidth)
      setWidth(newWidth)
    }
  }, [currentWordIndex])

  return (
    <Noise>
      <motion.div
        animate={{ opacity: 0.3 }}
        initial={{ opacity: 0 }}
        style={{
          backgroundImage: `url(/images/bgs/${backgroundImages[currentImageIndex]})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          height: '100vh',
          minHeight: '600px',
          transition: 'background-image 2s ease-in-out',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        transition={{ duration: 3 }}
      />
      <Center h="100vh" minHeight="600px">
        <VStack mt="-100px" spacing="lg">
          <BalancerLogo />
          <VStack spacing="md">
            <Heading alignItems="center" as="h1" display="flex" justifyContent="center" size="2xl">
              Build{' '}
              <motion.div
                animate={{
                  width,
                }}
                style={{
                  overflow: 'hidden',
                }}
                transition={{
                  type: 'spring',
                  bounce: 0.25,
                  duration: 0.8,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key={buildWords[currentWordIndex]}
                    ref={textRef}
                    style={{
                      display: 'inline-block',
                      marginInline: '0.2em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {buildWords[currentWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </motion.div>{' '}
              on Balancer V3
            </Heading>
            <Text color="font.secondary" fontSize="2xl" fontWeight="thin" textAlign="center">
              V3 consolidates, re-engineers and builds on previous innovations, <br />
              code less, build more.
            </Text>
          </VStack>

          <Button
            as={NextLink}
            href="https://app.merkl.xyz/"
            mt="lg"
            rightIcon={<ArrowUpRight />}
            size="lg"
            target="_blank"
            variant="secondary"
          >
            Get Started
          </Button>
        </VStack>
      </Center>
    </Noise>
  )
}
