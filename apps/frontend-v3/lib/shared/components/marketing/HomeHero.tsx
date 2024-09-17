'use client'
import { Button, Heading, Text, VStack, Flex, Box, useToken } from '@chakra-ui/react'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'
import NextLink from 'next/link'
import { Link } from '@chakra-ui/react'

import { ArrowUpRight } from 'react-feather'

import { HomeCaseStudies } from '@/lib/shared/components/marketing/HomeCaseStudies'

export function HomeHero() {
  const [bgColor] = useToken('colors', ['background.level1'])

  return (
    <Box className="hero" bg="background.level0">
      <Flex direction="column" justify="center" className="hero-container" position="relative">
        <Box position="relative">
          <Box
            className="home-hero-bg"
            position="absolute"
            width="100vw"
            height="100%"
            mx="auto"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          >
            <svg className="ying ying-path" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 18">
              <path d="M 0 0 H 32 C 24 0 16 0 16 9 C 16 18 8 18 0 18 V 0" fill={bgColor} />
            </svg>

            <svg
              className="ying ying-path-wide"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 18"
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
          direction={{ base: 'column', md: 'row' }}
          alignItems={{ base: 'null', md: 'center' }}
          height="100%"
        >
          <Flex
            direction="column"
            w="full"
            height="100%"
            justifyContent="center"
            alignItems={{ base: 'start', md: 'center' }}
            px={['ms', 'md']}
            py={['lg', 'lg']}
            background={{ base: 'background.level1', md: 'transparent' }}
          >
            <FadeInOnView>
              <Box py={{ base: 'xl', md: '2xl' }}>
                <Box h="24px">
                  <Text pb="lg" variant="eyebrow">
                    Balancer DEX App
                  </Text>
                </Box>
                <Heading
                  position="relative"
                  pb="lg"
                  fontWeight="normal"
                  left={{ base: '-5px', md: '-16px' }}
                  letterSpacing="-5px"
                  sx={{
                    fontSize: 'clamp(100px, 18vw, 200px)',
                  }}
                >
                  Earn
                </Heading>
                <Text pb="sm">Passive yield-bearing pools for Liquidity Providers</Text>
                <Box>
                  <Text variant="secondary" pb="lg">
                    Join <span>240,000+</span> Liquidity Providers
                  </Text>
                  <Button size="lg" as={NextLink} href="/pools" prefetch={true} variant="primary">
                    Explore pools
                  </Button>
                </Box>
              </Box>
            </FadeInOnView>
          </Flex>

          <Flex
            direction="column"
            bg="background.level0"
            w="full"
            px={['ms', 'md']}
            py={['lg', 'lg']}
            height="100%"
            justifyContent="center"
            alignItems={{ base: 'start', md: 'center' }}
          >
            <FadeInOnView>
              <Box py={{ base: 'xl', md: '2xl' }} mt={{ base: '0', md: '100px', lg: '150px' }}>
                <Box h="24px">
                  <Link href="/build/v3">
                    <Flex>
                      <Text background="font.special" backgroundClip="text" variant="eyebrow">
                        Balancer protocol: v3 Soon&nbsp;
                      </Text>
                      <Text variant="eyebrow" display="none" opacity="0" visibility="hidden">
                        Learn more
                      </Text>
                    </Flex>
                  </Link>
                </Box>

                <Heading
                  position="relative"
                  left={{ base: '-5px', md: '-16px' }}
                  pb="lg"
                  fontWeight="normal"
                  letterSpacing="-5px"
                  sx={{
                    fontSize: 'clamp(100px, 18vw, 200px)',
                  }}
                >
                  Build
                </Heading>
                <Text pb="sm">The trusted toolkit for true AMM experimentation</Text>
                <Box>
                  <Text variant="secondary" pb="lg">
                    Join <span>100+</span> protocol builders
                  </Text>
                  <button
                    className="btn-popover"
                    popovertarget="disclose"
                    popovertargetaction="toggle"
                  >
                    Start building
                  </button>
                  <div popover="auto" id="disclose" className="disclosure">
                    <FadeInOnView>
                      <Box>
                        <header>
                          <Flex
                            position="relative"
                            justifyContent="space-between"
                            background="background.button.secondary"
                            px="md"
                            alignItems="center"
                            height="48px"
                          >
                            <Text
                              fontWeight="bold"
                              fontSize="lg"
                              m="0"
                              p="0"
                              overflow="hidden"
                              whiteSpace="nowrap"
                              color="font.dark"
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
                              <Box role="group" px="md" py="sm" w="full" display="block">
                                <Link
                                  as={NextLink}
                                  href="/build/v3"
                                  prefetch={true}
                                  _groupHover={{
                                    textDecoration: 'none',
                                  }}
                                >
                                  <Text
                                    fontWeight="bold"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    transition="all 0.2s ease-out 0.1s"
                                    _groupHover={{
                                      color: 'font.maxContrast',
                                    }}
                                  >
                                    Balancer v3
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    variant="secondary"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    transition="all 0.2s ease-out 0.1s"
                                    _groupHover={{ color: 'font.maxContrast' }}
                                  >
                                    Learn about the key benefits
                                  </Text>
                                </Link>
                              </Box>

                              <Box role="group" px="md" py="sm" w="full" display="block">
                                <Link
                                  href="https://docs-v3.balancer.fi/"
                                  _groupHover={{
                                    textDecoration: 'none',
                                  }}
                                >
                                  <Flex alignItems="center" gap="xxs">
                                    <Text
                                      fontWeight="bold"
                                      whiteSpace="nowrap"
                                      overflow="hidden"
                                      transition="all 0.2s ease-out 0.1s"
                                      _groupHover={{ color: 'font.maxContrast' }}
                                    >
                                      v3 Docs
                                    </Text>
                                    <ArrowUpRight display="inline" size={12} />
                                  </Flex>
                                  <Text
                                    fontSize="sm"
                                    variant="secondary"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    transition="all 0.2s ease-out 0.1s"
                                    _groupHover={{ color: 'font.maxContrast' }}
                                  >
                                    Go deep down the rabbithole
                                  </Text>
                                </Link>
                              </Box>
                              <Box role="group" px="md" py="sm" w="full" display="block">
                                <Link
                                  href="https://github.com/balancer/scaffold-balancer-v3"
                                  _groupHover={{
                                    textDecoration: 'none',
                                  }}
                                >
                                  <Flex alignItems="center" gap="xxs">
                                    <Text
                                      fontWeight="bold"
                                      whiteSpace="nowrap"
                                      overflow="hidden"
                                      transition="all 0.2s ease-out 0.1s"
                                      _groupHover={{ color: 'font.maxContrast' }}
                                    >
                                      Scaffold Balancer v3
                                    </Text>
                                    <ArrowUpRight display="inline" size={12} />
                                  </Flex>
                                  <Text
                                    fontSize="sm"
                                    variant="secondary"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    transition="all 0.2s ease-out 0.1s"
                                    _groupHover={{ color: 'font.maxContrast' }}
                                  >
                                    Prototyping tool for Balancer v3
                                  </Text>
                                </Link>
                              </Box>
                              <Box role="group" px="md" py="sm" w="full" display="block">
                                <Link
                                  href="https://docs.balancer.fi/"
                                  _groupHover={{
                                    textDecoration: 'none',
                                  }}
                                >
                                  <Flex alignItems="center" gap="xxs">
                                    <Text
                                      fontWeight="bold"
                                      transition="all 0.2s ease-out 0.1s"
                                      _groupHover={{ color: 'font.maxContrast' }}
                                    >
                                      v2 Docs
                                    </Text>
                                    <ArrowUpRight display="inline" size={12} />
                                  </Flex>

                                  <Text
                                    fontSize="sm"
                                    variant="secondary"
                                    transition="all 0.2s ease-out 0.1s"
                                    _groupHover={{ color: 'font.maxContrast' }}
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                  >
                                    Build on battle-tested smart contracts
                                  </Text>
                                </Link>
                              </Box>
                              <Box role="group" px="md" py="sm" w="full" display="block">
                                <Link
                                  href="https://grants.balancer.community/"
                                  _groupHover={{
                                    textDecoration: 'none',
                                  }}
                                >
                                  <Flex alignItems="center" gap="xxs">
                                    <Text
                                      fontWeight="bold"
                                      transition="all 0.2s ease-out 0.1s"
                                      _groupHover={{ color: 'font.maxContrast' }}
                                    >
                                      Get a Grant
                                    </Text>
                                    <ArrowUpRight display="inline" size={12} />
                                  </Flex>
                                  <Text
                                    fontSize="sm"
                                    variant="secondary"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    transition="all 0.2s ease-out 0.1s"
                                    _groupHover={{ color: 'font.maxContrast' }}
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
