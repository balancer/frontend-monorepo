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
      <Box m="0 auto" maxW="maxContent" px={{ base: 'md', xl: '0' }}>
        <Box
          m="auto"
          maxW="4xl"
          pb={{ base: 'md', md: 'lg' }}
          textAlign={{ base: 'left', md: 'center' }}
          w="full"
        >
          <FadeInOnView>
            <Box m="auto" maxW="4xl">
              <Text pb="lg" variant="eyebrow" w="full">
                Code
              </Text>
              <Heading
                as="h2"
                pb="md"
                size="2xl"
                sx={{
                  textWrap: 'balance',
                }}
                w="full"
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
              <Box bg="background.level2" my="lg" p="md" rounded="xl" shadow="xl" textAlign="left">
                <SyntaxHighlighter
                  className="syntax-highlighter"
                  codeTagProps={{
                    style: {
                      fontSize: '12px',
                    },
                  }}
                  customStyle={{
                    margin: 0,
                    padding: '16px',
                    borderRadius: '0 0 8px 8px',
                  }}
                  language="solidity"
                  style={vscDarkPlus}
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
          </FadeInOnView>
        </Box>
      </Box>
    </Section>
  )
}
