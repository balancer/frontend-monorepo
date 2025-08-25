import { Box, Heading, HStack, Stack, Text, VStack, Link } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { FeatureLink } from './FeatureLink'
import { RadialPattern } from '@repo/lib/shared/components/zen/RadialPattern'
import { ArrowUpRight } from 'react-feather'

export function HeaderBanner() {
  const capitalEfficiencyDescription = `
  TODO
`

  const accessToHooksDescription = `
  TODO
`

  const immediateLiquidityDescription = `
  TODO
`

  return (
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
                Create a pool on Balancer
              </Heading>
            </Box>

            <Text color="font.secondary" maxW="48ch" sx={{ textWrap: 'balance' }}>
              Balancer handles the low level tasks, like token accounting and security, allowing you
              to focus on innovating with custom logic.
            </Text>
            <Link
              href="https://docs.balancer.fi/partner-onboarding/balancer-v3/v3-overview.html"
              isExternal
            >
              <HStack
                _hover={{ cursor: 'pointer', color: 'font.linkHover' }}
                color="font.link"
                gap="xxs"
              >
                <Text _hover={{ color: 'font.linkHover' }} color="font.link" variant="ghost">
                  View Partner docs
                </Text>
                <ArrowUpRight size={14} />
              </HStack>
            </Link>
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
            description={capitalEfficiencyDescription}
            title="Capital efficiency"
            transformBackground="rotate(90deg)"
          />

          <FeatureLink
            description={accessToHooksDescription}
            title="Access to hooks"
            transformBackground="rotate(0deg)"
          />

          <FeatureLink
            description={immediateLiquidityDescription}
            title="Immediate liquidity"
            transformBackground="rotate(-90deg)"
          />
        </Stack>
      </HStack>
    </NoisyCard>
  )
}
