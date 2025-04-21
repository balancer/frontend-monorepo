'use client'
import { Grid, GridItem, Heading, Stack, Text } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { VebalStepCard } from './VebalStepCard'

export function VebalHowSection() {
  return (
    <Stack alignItems="center" gap="md" pt={{ base: 'md', md: '0' }} px="md">
      <FadeInOnView animateOnce={false}>
        <Stack alignItems="center" gap="md" px="md">
          <Heading as="h2" backgroundClip="text" bg="background.gold" pb="0.5" size="lg">
            Here’s how it works
          </Heading>
          <Text color="font.secondary" maxWidth="38ch" pt="0" textAlign="center">
            Add liquidity to the ve8020 BAL/WETH pool and lock it up. The longer you lock, the more
            veBAL you get.
          </Text>
        </Stack>
      </FadeInOnView>
      <Grid
        alignItems="stretch"
        gap="lg"
        maxW="container.xl"
        pt="lg"
        templateColumns={['1fr', '1fr', 'repeat(3, 1fr)']}
      >
        <GridItem display="flex" height="100%">
          <FadeInOnView animateOnce={false}>
            <VebalStepCard
              altText="veBAL token"
              description={
                <>
                  Join ve8020 BAL/WETH—the Balancer protocol liquidity pool—to get the B-80BAL-20WETH
                  LP token.
                </>
              }
              heading="Add liquidity"
              imgName="tokens"
              step="1."
            />
          </FadeInOnView>
        </GridItem>
        <GridItem display="flex" height="100%">
          <FadeInOnView animateOnce={false}>
            <VebalStepCard
              altText="LP token"
              description={
                <>
                  Lock your B-80BAL-20WETH LP tokens for a period to receive veBAL. The longer you
                  lock, the more veBAL your get.
                </>
              }
              heading="Lock your LP tokens"
              imgName="lptoken"
              step="2."
            />
          </FadeInOnView>
        </GridItem>
        <GridItem display="flex" height="100%">
          <FadeInOnView animateOnce={false}>
            <VebalStepCard
              altText="veBAL token"
              description={
                <>
                  Earn protocol revenue + weekly voting incentives, boost liquidity mining, gain
                  governance power.
                </>
              }
              heading="Get power + rewards"
              imgName="vebal"
              step="3."
            />
          </FadeInOnView>
        </GridItem>
      </Grid>
    </Stack>
  )
}
