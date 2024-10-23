'use client'
import { Button, Heading, Text, VStack, Flex, Box, useToken } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import NextLink from 'next/link'
import { Link } from '@chakra-ui/react'

import { ArrowUpRight } from 'react-feather'

import { HomeCaseStudies } from '@repo/lib/shared/components/marketing/HomeCaseStudies'

export function HomeHero() {
  const [bgColor] = useToken('colors', ['background.level1'])

  return (
    <Box bg="background.level0" className="hero">
      <Flex className="hero-container" direction="column" justify="center" position="relative">
        <Box position="relative">
          <Box
            className="home-hero-bg"
            height="100%"
            left="50%"
            mx="auto"
            position="absolute"
            top="50%"
            transform="translate(-50%, -50%)"
            width="100vw"
          >
            <svg className="ying ying-path" viewBox="0 0 32 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 0 H 32 C 24 0 16 0 16 9 C 16 18 8 18 0 18 V 0" fill={bgColor} />
            </svg>

            <svg
              className="ying ying-path-wide"
              viewBox="0 0 32 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 0 0 H 32 c -10 0 -16 0 -16 7 C 16 14 10 14 0 14 V 0" fill={bgColor} />
            </svg>

            {/* <svg
              className=" ying ying-path-portrait-small"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 48"
            >
              <path d="M 0 0 H 32 C 27 0 27 0 27 24 C 27 48 27 48 0 48 Z" fill={bgColor} />
            </svg> */}
          </Box>
        </Box>
        <Flex
          alignItems={{ base: 'null', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          height="100%"
        >
          <Flex
            alignItems={{ base: 'start', md: 'center' }}
            background={{ base: 'background.level1', md: 'transparent' }}
            direction="column"
            height="100%"
            justifyContent="center"
            px={['ms', 'md']}
            py={['lg', 'lg']}
            w="full"
          >
            <FadeInOnView>
              <Box py={{ base: 'xl', md: '2xl' }}>
                <Box h="24px">
                  <Text pb="lg" variant="eyebrow">
                    Balancer DEX App
                  </Text>
                </Box>
                <Heading
                  fontWeight="normal"
                  left={{ base: '-5px', md: '-16px' }}
                  letterSpacing="-5px"
                  pb="lg"
                  position="relative"
                  sx={{
                    fontSize: 'clamp(100px, 18vw, 200px)',
                  }}
                >
                  Earn
                </Heading>
                <Text pb="sm">Passive yield-bearing pools for Liquidity Providers</Text>
                <Box>
                  <Text pb="lg" variant="secondary">
                    Join <span>240,000+</span> Liquidity Providers
                  </Text>
                  <Button as={NextLink} href="/pools" prefetch size="lg" variant="primary">
                    Explore pools
                  </Button>
                </Box>
              </Box>
            </FadeInOnView>
          </Flex>

          <Flex
            alignItems={{ base: 'start', md: 'center' }}
            bg="background.level0"
            direction="column"
            height="100%"
            justifyContent="center"
            px={['ms', 'md']}
            py={['lg', 'lg']}
            w="full"
          >
            <FadeInOnView>
              <Box mt={{ base: '0', md: '100px', lg: '150px' }} py={{ base: 'xl', md: '2xl' }}>
                <Box h="24px">
                  <Link href="/build/v3">
                    <Flex>
                      <Text background="font.special" backgroundClip="text" variant="eyebrow">
                        Balancer protocol: v3 Soon&nbsp;
                      </Text>
                      <Text display="none" opacity="0" variant="eyebrow" visibility="hidden">
                        Learn more
                      </Text>
                    </Flex>
                  </Link>
                </Box>

                <Heading
                  fontWeight="normal"
                  left={{ base: '-5px', md: '-16px' }}
                  letterSpacing="-5px"
                  pb="lg"
                  position="relative"
                  sx={{
                    fontSize: 'clamp(100px, 18vw, 200px)',
                  }}
                >
                  Build
                </Heading>
                <Text pb="sm">The trusted toolkit for true AMM experimentation</Text>
                <Box>
                  <Text pb="lg" variant="secondary">
                    Join <span>100+</span> protocol builders
                  </Text>
                  <button
                    className="btn-popover"
                    popovertarget="disclose"
                    popovertargetaction="toggle"
                  >
                    Start building
                  </button>
                  <div className="disclosure" id="disclose" popover="auto">
                    <FadeInOnView>
                      <Box>
                        <header>
                          <Flex
                            alignItems="center"
                            background="background.button.secondary"
                            height="48px"
                            justifyContent="space-between"
                            position="relative"
                            px="md"
                          >
                            <Text
                              color="font.dark"
                              fontSize="lg"
                              fontWeight="bold"
                              m="0"
                              overflow="hidden"
                              p="0"
                              whiteSpace="nowrap"
                            >
                              Start building
                            </Text>

                            {/* <Button popovertarget="disclose" popovertargetaction="close">
                              <Box position="relative" top="-4px" right="-4px">
                                <IconButton size="xs" icon={<CloseIcon />} />
                              </Box>
                            </Button> */}
                          </Flex>
                        </header>
                        <Box className="content">
                          <div className="actions">
                            <VStack alignItems="flex-start" gap="0">
                              <Box display="block" px="md" py="sm" role="group" w="full">
                                <Link
                                  _groupHover={{
                                    textDecoration: 'none',
                                  }}
                                  as={NextLink}
                                  href="/build/v3"
                                  prefetch
                                >
                                  <Text
                                    _groupHover={{
                                      color: 'font.maxContrast',
                                    }}
                                    fontWeight="bold"
                                    overflow="hidden"
                                    transition="all 0.2s ease-out 0.1s"
                                    whiteSpace="nowrap"
                                  >
                                    Balancer v3
                                  </Text>
                                  <Text
                                    _groupHover={{ color: 'font.maxContrast' }}
                                    fontSize="sm"
                                    overflow="hidden"
                                    transition="all 0.2s ease-out 0.1s"
                                    variant="secondary"
                                    whiteSpace="nowrap"
                                  >
                                    Learn about the key benefits
                                  </Text>
                                </Link>
                              </Box>

                              <Box display="block" px="md" py="sm" role="group" w="full">
                                <Link
                                  _groupHover={{
                                    textDecoration: 'none',
                                  }}
                                  href="https://docs-v3.balancer.fi/"
                                >
                                  <Flex alignItems="center" gap="xxs">
                                    <Text
                                      _groupHover={{ color: 'font.maxContrast' }}
                                      fontWeight="bold"
                                      overflow="hidden"
                                      transition="all 0.2s ease-out 0.1s"
                                      whiteSpace="nowrap"
                                    >
                                      v3 Docs
                                    </Text>
                                    <ArrowUpRight display="inline" size={12} />
                                  </Flex>
                                  <Text
                                    _groupHover={{ color: 'font.maxContrast' }}
                                    fontSize="sm"
                                    overflow="hidden"
                                    transition="all 0.2s ease-out 0.1s"
                                    variant="secondary"
                                    whiteSpace="nowrap"
                                  >
                                    Go deep down the rabbithole
                                  </Text>
                                </Link>
                              </Box>
                              <Box display="block" px="md" py="sm" role="group" w="full">
                                <Link
                                  _groupHover={{
                                    textDecoration: 'none',
                                  }}
                                  href="https://github.com/balancer/scaffold-balancer-v3"
                                >
                                  <Flex alignItems="center" gap="xxs">
                                    <Text
                                      _groupHover={{ color: 'font.maxContrast' }}
                                      fontWeight="bold"
                                      overflow="hidden"
                                      transition="all 0.2s ease-out 0.1s"
                                      whiteSpace="nowrap"
                                    >
                                      Scaffold Balancer v3
                                    </Text>
                                    <ArrowUpRight display="inline" size={12} />
                                  </Flex>
                                  <Text
                                    _groupHover={{ color: 'font.maxContrast' }}
                                    fontSize="sm"
                                    overflow="hidden"
                                    transition="all 0.2s ease-out 0.1s"
                                    variant="secondary"
                                    whiteSpace="nowrap"
                                  >
                                    Prototyping tool for Balancer v3
                                  </Text>
                                </Link>
                              </Box>
                              <Box display="block" px="md" py="sm" role="group" w="full">
                                <Link
                                  _groupHover={{
                                    textDecoration: 'none',
                                  }}
                                  href="https://docs.balancer.fi/"
                                >
                                  <Flex alignItems="center" gap="xxs">
                                    <Text
                                      _groupHover={{ color: 'font.maxContrast' }}
                                      fontWeight="bold"
                                      transition="all 0.2s ease-out 0.1s"
                                    >
                                      v2 Docs
                                    </Text>
                                    <ArrowUpRight display="inline" size={12} />
                                  </Flex>

                                  <Text
                                    _groupHover={{ color: 'font.maxContrast' }}
                                    fontSize="sm"
                                    overflow="hidden"
                                    transition="all 0.2s ease-out 0.1s"
                                    variant="secondary"
                                    whiteSpace="nowrap"
                                  >
                                    Build on battle-tested smart contracts
                                  </Text>
                                </Link>
                              </Box>
                              <Box display="block" px="md" py="sm" role="group" w="full">
                                <Link
                                  _groupHover={{
                                    textDecoration: 'none',
                                  }}
                                  href="https://grants.balancer.community/"
                                >
                                  <Flex alignItems="center" gap="xxs">
                                    <Text
                                      _groupHover={{ color: 'font.maxContrast' }}
                                      fontWeight="bold"
                                      transition="all 0.2s ease-out 0.1s"
                                    >
                                      Get a Grant
                                    </Text>
                                    <ArrowUpRight display="inline" size={12} />
                                  </Flex>
                                  <Text
                                    _groupHover={{ color: 'font.maxContrast' }}
                                    fontSize="sm"
                                    overflow="hidden"
                                    transition="all 0.2s ease-out 0.1s"
                                    variant="secondary"
                                    whiteSpace="nowrap"
                                  >
                                    Help to get you set up
                                  </Text>
                                </Link>
                              </Box>
                            </VStack>
                          </div>
                        </Box>
                      </Box>
                    </FadeInOnView>
                  </div>
                </Box>
              </Box>
            </FadeInOnView>
          </Flex>
        </Flex>
      </Flex>

      <Box>
        <FadeInOnView>
          <HomeCaseStudies />
        </FadeInOnView>
      </Box>
    </Box>
  )
}
