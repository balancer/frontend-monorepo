import {
  Heading,
  Text,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'

export function V3About() {
  return (
    <Section className="about-v3">
      <Box m="0 auto" maxW="maxContent" px={{ base: 'md', xl: '0' }}>
        <Box
          m="auto"
          maxW="4xl"
          pb={{ base: 'lg', md: '2xl' }}
          textAlign={{ base: 'left', md: 'center' }}
          w="full"
        >
          <Text pb="lg" variant="eyebrow" w="full">
            Core Features
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
            Code less. Build more.
          </Heading>
          <Text
            sx={{
              textWrap: 'balance',
            }}
            w="full"
          >
            To simplify the developer experience, v3 removes complexity from the creation of new
            AMMs and custom pools by optimizing the vault and creating a new hooks framework.
          </Text>
        </Box>

        <Box m="auto" maxW="2xl" w="full">
          <Accordion allowMultiple>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" py="ms" textAlign="left">
                    <Text fontWeight="bold">Simplified AMM Deployment </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pr="xl">
                <Text
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  Remove low-level tasks. Supply custom AMM logic, and harness the full benefit of
                  an optimised tech stack
                </Text>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" py="ms" textAlign="left">
                    <Text fontWeight="bold">Reusable Hooks</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pr="xl">
                <Text
                  pb="sm"
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  Easily extend existing pool types at various key points throughout the pool’s
                  lifecycle to unlock an infinite design space.
                </Text>{' '}
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" py="ms" textAlign="left">
                    <Text fontWeight="bold">Optimized Vault</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pr="xl">
                <Text
                  pb="sm"
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  Repeated custom pool design patterns are shifted into the vault, ensuring
                  consistency across all pools and removing sources of significant complexity from
                  the pool contract.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" py="ms" textAlign="left">
                    <Text fontWeight="bold">Decimal Scaling</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pr="xl">
                <Text
                  pb="sm"
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  To alleviate the challenges of managing tokens with variable decimals, the vault
                  provides the pool with token balances and input values scaled to 18 decimals.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" py="ms" textAlign="left">
                    <Text fontWeight="bold">Rate Scaling</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pr="xl">
                <Text
                  pb="sm"
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  v3 abstracts the complexity of managing LSTs by moving all rate scaling into the
                  vault, providing pools with uniform rate-scaled balances and input values by
                  default, ensuring that yield from yield-bearing tokens is not captured by
                  arbitrage traders.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" py="ms" textAlign="left">
                    <Text fontWeight="bold">Liquidity Invariant Approximation</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pr="xl">
                <Text
                  pb="sm"
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  Supports unbalanced add/remove liquidity operations across all pool types,
                  dramatically enhancing user experience, as users are not forced to add liquidity
                  in proportional amounts.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" py="ms" textAlign="left">
                    <Text fontWeight="bold">Transient Accounting</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pr="xl">
                <Text
                  pb="sm"
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  EIP-1153&rsquo;s transient op-codes unlock a new, expressive design, the “Till”
                  pattern. This allows the vault to efficiently enforce contract-level invariants in
                  the scope of a callback, supporting design patterns that were previously not
                  possible.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" py="ms" textAlign="left">
                    <Text fontWeight="bold">ERC20MultiToken</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pr="xl">
                <Text
                  pb="sm"
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  Ensures atomic updates to pool token balances and total supply within the vault,
                  reducing risks of read-only reentrancy attack vectors.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" py="ms" textAlign="left">
                    <Text fontWeight="bold">Swap Fee Management</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pr="xl">
                <Text
                  pb="sm"
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  Standardizes swap fee implementation within the vault for consistent interfaces
                  across pools, while allowing flexibility at the hook level.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" py="ms" textAlign="left">
                    <Text fontWeight="bold">Pool Creator Fee</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pr="xl">
                <Text
                  pb="sm"
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  Introduces a permissionless mechanism for external pool developers to earn a share
                  of swap fees and yield, incentivizing innovative AMM creation.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" py="ms" textAlign="left">
                    <Text fontWeight="bold">Pool Pause Manager</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pr="xl">
                <Text
                  pb="sm"
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  The pool can define its pause window on registration, relying on the vault to
                  enforce the time window and manage authentication.
                </Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      </Box>
    </Section>
  )
}
