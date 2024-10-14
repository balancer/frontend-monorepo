/* eslint-disable max-len */
import { Button, Heading, Text, Flex, Box } from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import NextLink from 'next/link'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export function V3Technical() {
  const code = `
function onSwap(PoolSwapParams calldata params)
  external
  pure
  returns (uint256 amountCalculatedScaled18) 
{
    uint256 poolBalancetokenOut = 
      params.balancesScaled18[params.indexOut]; // Y
    uint256 poolBalancetokenIn =
      params.balancesScaled18[params.indexIn]; // X
    uint256 amountTokenIn =
      params.amountGivenScaled18; // dx

    amountCalculatedScaled18 =
      (poolBalancetokenOut * amountTokenIn) /
      (poolBalancetokenIn + amountTokenIn); // dy
}`

  return (
    <Section className="technical">
      <Box maxW="maxContent" m="0 auto" px={{ base: 'md', xl: '0' }}>
        <Box
          pb={{ base: 'md', md: 'lg' }}
          w="full"
          maxW="4xl"
          m="auto"
          textAlign={{ base: 'left', md: 'center' }}
        >
          <FadeInOnView>
            <Box maxW="4xl" m="auto">
              <Text pb="lg" variant="eyebrow" w="full">
                Code
              </Text>
              <Heading
                pb="md"
                w="full"
                as="h2"
                size="2xl"
                sx={{
                  textWrap: 'balance',
                }}
              >
                Building on v3 is simple
              </Heading>
              <Text
                pb="sm"
                sx={{
                  textWrap: 'balance',
                }}
              >
                To make custom pool creation easy, core functions have been moved from pools into
                the heavily audited vault. For example, here&rsquo;s all the code needed to build a
                swap function for a Constant Product Pool.
              </Text>
            </Box>
          </FadeInOnView>

          <FadeInOnView>
            <Box mb="xl">
              <Box bg="background.level2" my="lg" p="md" textAlign="left" rounded="xl" shadow="xl">
                <SyntaxHighlighter
                  language="solidity"
                  style={vscDarkPlus}
                  className="syntax-highlighter"
                  customStyle={{
                    margin: 0,
                    padding: '16px',
                    borderRadius: '0 0 8px 8px',
                  }}
                  codeTagProps={{
                    style: {
                      fontSize: '12px',
                    },
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </Box>
            </Box>
          </FadeInOnView>

          <FadeInOnView>
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
          </FadeInOnView>
        </Box>
      </Box>
    </Section>
  )
}
