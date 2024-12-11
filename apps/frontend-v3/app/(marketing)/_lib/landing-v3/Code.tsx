/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { Box, Card, Center, Stack, Text, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { useIsDarkMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { RadialPattern } from './shared/RadialPattern'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'
import { FadeIn } from '@repo/lib/shared/components/animations/FadeIn'
import { BlurIn } from '@repo/lib/shared/components/animations/BlurIn'
import { useEffect, useRef, useState } from 'react'
import Prism from 'prismjs'
import './vscode.theme.css'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-solidity'
import { useInView } from 'framer-motion'

const TYPING_SPEED = 20 // milliseconds per character

const codeSnippet = `// Swap function on constant product pool
function onSwap(PoolSwapParams calldata params)
  external
  pure
  returns (uint256 amountCalculatedScaled18)
{
  uint256 poolBalanceTokenOut =
    params.balancesScaled18[params.indexOut]; // Y
  uint256 poolBalanceTokenIn =
    params.balancesScaled18[params.indexIn]; // X
  uint256 amountTokenIn =
    params.amountGivenScaled18; // dx

  amountCalculatedScaled18 =
    (poolBalanceTokenOut * amountTokenIn) /
    (poolBalanceTokenIn * amountTokenIn); // dy
}`

export function Code() {
  const isDarkMode = useIsDarkMode()
  const { isMobile } = useBreakpoints()
  const [displayedText, setDisplayedText] = useState('')
  const codeBoxRef = useRef(null)
  const isInView = useInView(codeBoxRef, { once: true, margin: '-100px' })

  useEffect(() => {
    if (isInView) {
      setDisplayedText('')

      let currentIndex = 0
      const intervalId = setInterval(() => {
        if (currentIndex <= codeSnippet.length - 1) {
          const nextText = codeSnippet.slice(0, currentIndex + 1)
          setDisplayedText(Prism.highlight(nextText, Prism.languages.solidity, 'solidity'))
          currentIndex++
        } else {
          clearInterval(intervalId)
        }
      }, TYPING_SPEED)

      return () => clearInterval(intervalId)
    }
  }, [isInView])

  return (
    <Noise backgroundColor="background.level0WithOpacity" position="relative">
      <DefaultPageContainer noVerticalPadding position="relative" py={['3xl', '10rem']}>
        <VStack alignItems="center" spacing="md" textAlign="center">
          <WordsPullUp
            as="h2"
            color="font.primary"
            fontSize="4xl"
            fontWeight="bold"
            letterSpacing="-0.04rem"
            lineHeight={1}
            text="Code less, build more."
          />
          <FadeIn delay={0.2} direction="up" duration={0.6}>
            <Text color="font.secondary" fontSize="lg" maxW="2xl">
              Balancer v3’s architecture focuses on simplicity, flexibility, and extensibility at
              its core. The v3 Vault more formally defines the requirements of a custom pool,
              shifting core design patterns out of the pool and into the Vault.
            </Text>
          </FadeIn>
        </VStack>
        <Card mt="2xl">
          <Box background="background.level0" minH="500px" position="relative" shadow="innerXl">
            <Box
              bottom={0}
              h="100%"
              left={0}
              opacity={isDarkMode ? 0.3 : 0.2}
              overflow="hidden"
              position="absolute"
              right={0}
              shadow="innerXl"
              top={0}
              w="100%"
            >
              <RadialPattern
                circleCount={12}
                height={800}
                innerHeight={100}
                innerWidth={100}
                intensity={2}
                left="calc(50% - 400px)"
                padding="15px"
                position="absolute"
                top="calc(50% - 400px)"
                width={800}
              />
            </Box>
            <Center px={{ base: 'xs', lg: '2xl' }} py="2xl">
              <Stack
                alignItems="center"
                direction={{ base: 'column', lg: 'row' }}
                gap="2xl"
                w="full"
              >
                <Box w="full">
                  <VStack alignItems="start" px={{ base: 'md', lg: '0' }} spacing="lg">
                    <BlurIn delay={0.4}>
                      <Text
                        background="font.specialSecondary"
                        backgroundClip="text"
                        fontSize="sm"
                        variant="eyebrow"
                      >
                        SIMPLICITY
                      </Text>
                    </BlurIn>
                    <WordsPullUp
                      as="h3"
                      color="font.primary"
                      fontSize={{ base: '2xl', lg: '4xl' }}
                      fontWeight="bold"
                      letterSpacing="-0.04rem"
                      lineHeight={1}
                      pr={{ base: 'xxs', lg: '0.9' }}
                      text="Building on v3 is simple"
                    />
                    <FadeIn delay={0.2} direction="up" duration={0.6}>
                      <Text color="font.secondary">
                        To make custom pool creation easy, core functions have been moved from pools
                        into the heavily audited Vault. For example, here’s all the code needed to
                        build a swap function for a Constant Product Pool.
                      </Text>
                    </FadeIn>
                  </VStack>
                </Box>
                <Box w="full">
                  <Card ref={codeBoxRef}>
                    <pre
                      className="language-solidity"
                      style={{
                        padding: '2rem',
                        borderRadius: '8px',
                        minHeight: '400px',
                      }}
                    >
                      <code
                        className="language-solidity"
                        dangerouslySetInnerHTML={{ __html: displayedText }}
                        style={{
                          whiteSpace: isMobile ? 'pre-line' : 'pre',
                          wordBreak: isMobile ? 'break-word' : 'normal',
                        }}
                      />
                    </pre>
                  </Card>
                </Box>
              </Stack>
            </Center>
          </Box>
        </Card>
      </DefaultPageContainer>
      <Box
        bgGradient="linear(transparent 0%, background.base 50%, transparent 100%)"
        bottom="0"
        h="200px"
        left="0"
        mb="-100px"
        position="absolute"
        w="full"
      />
    </Noise>
  )
}
