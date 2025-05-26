import { Box, Button, Heading, HStack, Text, useDisclosure, VStack } from '@chakra-ui/react'
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
          spacing={{ base: '40px', lg: undefined }}
          p="8"
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
                position="relative"
                onClick={onOpen}
                top="4px"
                variant="ghost"
              >
                Learn more
              </Button>
            </VStack>
          </VStack>

          <HStack spacing={8}>
            <RadialPattern
              circleCount={8}
              height={600}
              innerHeight={120}
              innerWidth={1000}
              padding="15px"
              position="absolute"
              right={{ base: -500, lg: -700, xl: -600, '2xl': -400 }}
              left="350px"
              top="-195px"
              width={1500}
            />

            <FeatureLink title="Fair price discovery" description={fairPriceDescription} />
            <FeatureLink title="Capital efficiency" description={capitalEfficiencyDescription} />
            <FeatureLink title="Immediate liquidity" description={immediateLiquidityDescription} />
          </HStack>
        </HStack>
      </NoisyCard>

      <LearnMoreModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
