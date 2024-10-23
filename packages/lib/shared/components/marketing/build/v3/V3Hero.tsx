import { Button, Heading, Text, Flex, Box } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import NextLink from 'next/link'

export function V3Hero() {
  return (
    <Box className="hero" pb="2xl">
      {/* <SandPatterns> */}
      <Flex direction="column" justify="center" pb="2xl">
        <Flex
          alignItems={{ base: 'null', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          height="100%"
        >
          <Flex
            alignItems={{ base: 'start', md: 'center' }}
            direction="column"
            justifyContent="center"
            px={['ms', 'md']}
            py={['lg', 'lg']}
            w="full"
          >
            <Box
              m="auto"
              maxW="4xl"
              pb={{ base: 'md', md: 'lg' }}
              py={{ base: 'lg', md: '2xl' }}
              textAlign={{ base: 'left', md: 'center' }}
              w="full"
            >
              <FadeInOnView>
                <Text pb="xl" variant="eyebrow" w="full">
                  Balancer v3
                </Text>
                <Heading
                  fontWeight="normal"
                  left={{ base: '-3px', md: '0' }}
                  letterSpacing="-5px"
                  lineHeight="0.9"
                  pb="xl"
                  position="relative"
                  sx={{
                    fontSize: 'clamp(100px, 15vw, 120px)',
                  }}
                  w="full"
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
                    m={{ base: 'none', md: 'auto' }}
                    width="max-content"
                  >
                    <Button
                      as={NextLink}
                      flex="1"
                      href="https://docs-v3.balancer.fi/"
                      size="lg"
                      variant="primary"
                    >
                      View v3 docs
                    </Button>

                    <Button
                      as={NextLink}
                      flex="1"
                      href="https://github.com/balancer/scaffold-balancer-v3"
                      size="lg"
                      variant="secondary"
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
