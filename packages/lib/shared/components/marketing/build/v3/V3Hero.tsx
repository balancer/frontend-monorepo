import { Button, Heading, Text, Flex, Box } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import NextLink from 'next/link'

export function V3Hero() {
  return (
    <Box className="hero" pb="2xl">
      {/* <SandPatterns> */}
      <Flex direction="column" justify="center" pb="2xl">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          alignItems={{ base: 'null', md: 'center' }}
          height="100%"
        >
          <Flex
            direction="column"
            w="full"
            justifyContent="center"
            alignItems={{ base: 'start', md: 'center' }}
            px={['ms', 'md']}
            py={['lg', 'lg']}
          >
            <Box
              py={{ base: 'lg', md: '2xl' }}
              pb={{ base: 'md', md: 'lg' }}
              w="full"
              maxW="4xl"
              m="auto"
              textAlign={{ base: 'left', md: 'center' }}
            >
              <FadeInOnView>
                <Text pb="xl" variant="eyebrow" w="full">
                  Balancer v3
                </Text>
                <Heading
                  position="relative"
                  pb="xl"
                  fontWeight="normal"
                  left={{ base: '-3px', md: '0' }}
                  letterSpacing="-5px"
                  lineHeight="0.9"
                  w="full"
                  sx={{
                    fontSize: 'clamp(100px, 15vw, 120px)',
                  }}
                >
                  AMMs made easy
                </Heading>
                <Text
                  pb="lg"
                  sx={{
                    textWrap: 'balance',
                  }}
                >
                  Balancer v3 powers the next generation of AMM innovation. Simplified pool creation
                  with an optimized vault. Plug in audited reusable hooks for additional
                  functionality.
                </Text>
                <Box>
                  <Flex
                    gap="ms"
                    justify={{ base: 'start', md: 'center' }}
                    width="max-content"
                    m={{ base: 'none', md: 'auto' }}
                  >
                    <Button
                      size="lg"
                      as={NextLink}
                      href="https://docs-v3.balancer.fi/"
                      variant="primary"
                      flex="1"
                    >
                      View v3 docs
                    </Button>

                    <Button
                      size="lg"
                      as={NextLink}
                      href="https://github.com/balancer/scaffold-balancer-v3"
                      variant="secondary"
                      flex="1"
                    >
                      Prototype on v3
                    </Button>
                  </Flex>
                </Box>
              </FadeInOnView>
            </Box>
          </Flex>
        </Flex>
      </Flex>

      {/* </SandPatterns> */}
    </Box>
  )
}
