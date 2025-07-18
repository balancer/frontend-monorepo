import { Box, Button, Heading, HStack, Stack, Text, useDisclosure, VStack } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { LearnMoreModal } from './LearnMoreModal'
import { FeatureLink } from './FeatureLink'
import { RadialPattern } from '@repo/lib/shared/components/zen/RadialPattern'
import { LbpBenefitsScalesIcon } from '@repo/lib/shared/components/icons/lbp/LbpBenefitsScalesIcon'
import { LbpBenefitsChartIcon } from '@repo/lib/shared/components/icons/lbp/LbpBenefitsChartIcon'
import { LbpBenefitsLightningIcon } from '@repo/lib/shared/components/icons/lbp/LbpBenefitsLightningIcon'

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
  Once the LBP concludes, you get immediate access to the funds raised. Further,
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
          rounded: 'xl',
          mb: 'xl',
        }}
      >
        <HStack
          alignItems={{ base: 'start', md: 'center' }}
          flexDirection={{ base: 'column', lg: 'row' }}
          justifyContent={{ base: 'start', lg: 'space-between' }}
          p={{ base: 'lg', lg: 'xl' }}
          spacing={{ base: 'md', lg: undefined }}
          w="full"
        >
          <VStack
            alignItems="start"
            pt="sm"
            spacing="30px"
            w={{ base: 'full', lg: undefined }}
            zIndex={1}
          >
            <VStack alignItems="start" spacing="ms">
              <Box maxW="290px">
                <Heading as="h1" size="lg" sx={{ textWrap: 'nowrap' }} variant="special">
                  Create an LBP token sale
                </Heading>
              </Box>

              <Text color="font.secondary" maxW="38ch" sx={{ textWrap: 'balance' }}>
                A fair, transparent mechanism for price discovery that protects both project
                creators and early supporters.
              </Text>

              <Button
                _hover={{ color: 'font.linkHover' }}
                color="font.link"
                fontSize="md"
                fontWeight="medium"
                left={{ base: '-8px', md: '-12px' }}
                onClick={onOpen}
                position="relative"
                top="-8px"
                variant="ghost"
              >
                Learn more
              </Button>
            </VStack>
          </VStack>

          <Stack
            direction={{ base: 'column', md: 'row' }}
            justifyContent="stretch"
            spacing={{ base: 4, md: 2, lg: 4, xl: 8 }}
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

            <RadialPattern
              bottom="-500px"
              circleCount={10}
              height={800}
              innerHeight={150}
              innerWidth={150}
              left="-400px"
              position="absolute"
              width={800}
              zIndex={0}
            />

            <FeatureLink
              description={fairPriceDescription}
              icon={<LbpBenefitsScalesIcon />}
              title="Fair price discovery"
              transformBackground="rotate(0deg)"
            />
            <FeatureLink
              description={capitalEfficiencyDescription}
              icon={<LbpBenefitsChartIcon />}
              title="Capital efficiency"
              transformBackground="rotate(90deg)"
            />
            <FeatureLink
              description={immediateLiquidityDescription}
              icon={<LbpBenefitsLightningIcon />}
              title="Immediate liquidity"
              transformBackground="rotate(-90deg)"
            />
          </Stack>
        </HStack>
      </NoisyCard>

      <LearnMoreModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
