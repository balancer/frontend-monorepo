'use client'
import { Grid, GridItem, Heading, Stack, Text, chakra, Link } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { VebalStepCard } from './VebalStepCard'
import NextLink from 'next/link'

export function VebalHowSection() {
  return (
    <Stack alignItems="center" gap="md" pt={{ base: 'md', md: '0' }} px="md">
      <FadeInOnView animateOnce={false}>
        <Stack alignItems="center" gap="md" px="md">
          <Heading as="h2" backgroundClip="text" bg="background.gold" pb="0.5" size="lg">
            Here’s how it works
          </Heading>
          <Text
            color="font.secondary"
            lineHeight="1.4"
            maxWidth="38ch"
            pt="0"
            sx={{ textWrap: 'pretty' }}
            textAlign="center"
          >
            Add liquidity to the ve8020 BAL/WETH pool and lock it up. The longer you lock, the more
            veBAL you get.
          </Text>
        </Stack>
      </FadeInOnView>
      <Grid
        alignItems="stretch"
        gap={{ base: 'md', md: 'ms', lg: 'md', xl: 'lg ' }}
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
                  <Link
                    as={NextLink}
                    color="font.secondary"
                    href="/pools/ethereum/v2/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014"
                    textDecoration="underline"
                    textDecorationStyle="dotted"
                    textDecorationThickness="1px"
                    textUnderlineOffset="3px"
                  >
                    Join
                  </Link>
                  &nbsp;80/20 BAL/WETH—aka the ve8020 Balancer protocol liquidity pool—to get the{' '}
                  <chakra.span style={{ whiteSpace: 'nowrap' }}>B-80BAL-20WETH</chakra.span> LP
                  token.
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
                  <Link
                    as={NextLink}
                    color="font.secondary"
                    href="/vebal/manage/"
                    textDecoration="underline"
                    textDecorationStyle="dotted"
                    textDecorationThickness="1px"
                    textUnderlineOffset="3px"
                  >
                    Lock
                  </Link>{' '}
                  your <chakra.span style={{ whiteSpace: 'nowrap' }}>B-80BAL-20WETH</chakra.span> LP
                  tokens for a period to receive veBAL. The longer you lock, the more veBAL you get.
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
