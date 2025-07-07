import { Box, Button, Heading, HStack, Stack, Text, useDisclosure, VStack } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { LearnMoreModal } from './LearnMoreModal'
import { FeatureLink } from './FeatureLink'
import { RadialPattern } from '@repo/lib/shared/components/zen/RadialPattern'

export function HeaderBanner() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const fairPriceDescription = `
  The dynamic weight adjustment mechanism in LBPs prevent price manipulation
  and ensures natural price discovery. The gradual shift from a high token
  weight to a lower weight over time creates a smoother pricing curve, making
  it more difficult for whales to dominate the initial distribution.
`
  const capitalEfficiencyDescription = `
  Projects can launch with minimal starting capital since LBPs don't require
  the traditional 50:50 asset ratio. Teams can start with as little as 5-10%
  of the collateral asset (like USDC or ETH) paired with their token, significantly
  reducing initial capital requirements.
`
  const immediateLiquidityDescription = `
  Once the LBP concludes, you get inmmediate access to the funds raised. Further,
  the new token holders can immediately trade their tokens, providing instant
  liquidity without lengthy lock-up periods. This gives early supporters flexibility
  in managing their positions.
`

  return (
    <>
      <NoisyCard
        cardProps={{
          w: 'full',
          overflow: 'hidden',
        }}
      >
        <HStack
          alignItems={{ base: 'start', md: 'center' }}
          flexDirection={{ base: 'column', md: 'row' }}
          justifyContent={{ base: 'start', lg: 'space-between' }}
          p="8"
          spacing={{ base: '40px', lg: undefined }}
          w="full"
        >
          <VStack pt="sm" spacing="30px" w={{ base: 'full', lg: undefined }}>
            <VStack alignItems="start" spacing="ms">
              <Box maxW="290px">
                <Heading as="h2" size="lg" sx={{ textWrap: 'nowrap' }} variant="special">
                  Create an LBP token sale
                </Heading>
              </Box>

              <Text color="font.secondary" sx={{ textWrap: 'balance' }}>
                A fair, transparent mechanism for price discovery that protects both project
                creators and early supporters.
              </Text>

              <Button
                _hover={{ color: 'font.linkHover' }}
                color="font.link"
                onClick={onOpen}
                position="relative"
                top="4px"
                variant="ghost"
              >
                Learn more
              </Button>
            </VStack>
          </VStack>

          <Stack
            direction={{ base: 'column', xl: 'row' }}
            justifyContent="stretch"
            spacing={8}
            w="full"
          >
            <RadialPattern
              circleCount={8}
              height={600}
              innerHeight={120}
              innerWidth={1000}
              left="350px"
              padding="15px"
              position="absolute"
              right={{ base: -500, lg: -700, xl: -600, '2xl': -400 }}
              top="-195px"
              width={1500}
            />

            <FeatureLink description={fairPriceDescription} title="Fair price discovery" />
            <FeatureLink description={capitalEfficiencyDescription} title="Capital efficiency" />
            <FeatureLink description={immediateLiquidityDescription} title="Immediate liquidity" />
          </Stack>
        </HStack>
      </NoisyCard>

      <LearnMoreModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
