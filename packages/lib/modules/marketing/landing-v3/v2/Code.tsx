/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { Box, Card, Center, Grid, GridItem, Heading, Text, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { useIsDarkMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import PrismLoader from '@repo/lib/shared/services/prism/PrismLoader'

import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { RadialPattern } from './shared/RadialPattern'

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

  return (
    <Noise backgroundColor="background.level0WithOpacity" position="relative">
      <DefaultPageContainer noVerticalPadding py={['xl', '10rem']}>
        <VStack alignItems="center" spacing="md" textAlign="center">
          <Heading>Code less, build more.</Heading>
          <Text color="font.secondary" fontSize="lg" maxW="2xl">
            Balancer v3’s architecture focuses on simplicity, flexibility, and extensibility at its
            core. The v3 vault more formally defines the requirements of a custom pool, shifting
            core design patterns out of the pool and into the vault.
          </Text>
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
            <Center position="relative">
              <Grid
                alignItems="center"
                gap="2xl"
                px={{ base: 'xs', lg: '2xl' }}
                py="2xl"
                templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
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
                    <Heading as="h4" size="xl">
                      Building on v3 is simple
                    </Heading>
                    <Text color="font.secondary" fontSize="lg">
                      To make custom pool creation easy, core functions have been moved from pools
                      into the heavily audited vault. For example, here’s all the code needed to
                      build a swap function for a Constant Product Pool.
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem maxW="100%">
                  <Card>
                    <pre
                      className="language-solidity"
                      style={{
                        padding: '2rem',
                        borderRadius: '8px',
                      }}
                    >
                      <code
                        className="language-solidity"
                        style={{
                          whiteSpace: isMobile ? 'pre-line' : 'pre',
                          wordBreak: isMobile ? 'break-word' : 'normal',
                        }}
                      >
                        {codeSnippet}
                      </code>
                    </pre>
                  </Card>
                </GridItem>
              </Grid>
            </Center>
          </Box>
        </Card>
      </DefaultPageContainer>
      <PrismLoader />
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
