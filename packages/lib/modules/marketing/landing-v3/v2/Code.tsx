/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { Box, Card, Center, Grid, GridItem, Heading, Text, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { useIsDarkMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import Image from 'next/image'
import PrismLoader from '@repo/lib/shared/services/prism/PrismLoader'

// @ts-ignore
import bgSrc from './images/sand-pattern-1.svg'
// @ts-ignore
import bgSrcDark from './images/sand-pattern-1-dark.svg'
// @ts-ignore
import bgCirclesSrc from './images/circles-right.svg'

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

  return (
    <Noise backgroundColor="background.level0WithOpacity">
      <DefaultPageContainer>
        <Card>
          <Box background="background.level0" minH="500px" position="relative" shadow="innerXl">
            <Box
              bottom={0}
              h="100%"
              left={0}
              opacity={isDarkMode ? 0.3 : 0.2}
              position="absolute"
              right={0}
              shadow="innerXl"
              top={0}
              w="100%"
            >
              <Image
                alt="background"
                fill
                sizes="100vw"
                src={isDarkMode ? bgSrcDark : bgSrc}
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </Box>
            <Center minH="500px" position="relative">
              <Grid
                alignItems="center"
                gap="2xl"
                px="2xl"
                py="2xl"
                templateColumns={{ base: '1fr', md: '1fr 1fr' }}
              >
                <GridItem>
                  <VStack alignItems="start" spacing="md">
                    <Text
                      background="font.specialSecondary"
                      backgroundClip="text"
                      fontSize="sm"
                      textTransform="uppercase"
                    >
                      SIMPLICITY
                    </Text>
                    <Heading as="h4" size="lg">
                      Building on v3 is simple
                    </Heading>
                    <Text color="font.secondary">
                      To make custom pool creation easy, core functions have been moved from pools
                      into the heavily audited vault. For example, here’s all the code needed to
                      build a swap function for a Constant Product Pool.
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem>
                  <Card>
                    <pre
                      className="language-solidity"
                      style={{
                        minHeight: '400px',
                        padding: '2rem',
                        borderRadius: '8px',
                      }}
                    >
                      <code className="language-solidity">{codeSnippet}</code>
                    </pre>
                  </Card>
                </GridItem>
              </Grid>
            </Center>
          </Box>
        </Card>
      </DefaultPageContainer>
      <Box minH="500px" position="relative" w="full">
        <Box
          bottom={0}
          h="500px"
          left={0}
          opacity={isDarkMode ? 0.1 : 0.4}
          position="absolute"
          top={0}
          w="100vw"
        >
          <Image
            alt="background"
            fill
            sizes="100vw"
            src={bgCirclesSrc}
            style={{ objectFit: 'contain', objectPosition: 'left', rotate: '180deg' }}
          />
        </Box>
      </Box>
      <PrismLoader />
    </Noise>
  )
}
