'use client'

import {
  VStack,
  Text,
  Grid,
  GridItem,
  Center,
  Box,
  useDisclosure,
  BoxProps,
} from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { BeetsIcon } from '@repo/lib/shared/components/icons/logos/BeetsIcon'
import { CowIcon } from '@repo/lib/shared/components/icons/logos/CowIcon'
import { AuraIcon } from '@repo/lib/shared/components/icons/logos/AuraIcon'
import { GyroIcon } from '@repo/lib/shared/components/icons/logos/GyroIcon'
import { XaveIcon } from '@repo/lib/shared/components/icons/logos/XaveIcon'
import { QuantAmmIcon } from '@repo/lib/shared/components/icons/logos/QuantAmmIcon'
import { ReactNode, useEffect, useState } from 'react'
import {
  PartnerRedirectModal,
  RedirectPartner,
} from '@repo/lib/shared/components/modals/PartnerRedirectModal'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { FeatureCard } from './shared/FeatureCard'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'
import { FadeIn } from '@repo/lib/shared/components/animations/FadeIn'
import { GetProtocolStatsQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'

function PartnerButton({ icon, ...props }: { icon: ReactNode } & BoxProps) {
  return (
    <Box
      _hover={{
        bg: 'background.level3',
      }}
      bg="background.level2"
      color="font.primary"
      cursor="pointer"
      h="full"
      p="md"
      rounded="lg"
      shadow="md"
      transition="background 0.5s ease-in-out"
      w="full"
      {...props}
    >
      <Center
        _hover={{ opacity: 1 }}
        h="full"
        opacity={0.7}
        transition="opacity 0.5s ease-in-out"
        w="full"
      >
        {icon}
      </Center>
    </Box>
  )
}

export function Grow({ protocolData }: { protocolData: GetProtocolStatsQuery }) {
  const [redirectPartner, setRedirectPartner] = useState<RedirectPartner>(RedirectPartner.Aura)
  const partnerRedirectDisclosure = useDisclosure()
  const { isMobile } = useBreakpoints()

  function openRedirectModal(partner: RedirectPartner) {
    setRedirectPartner(partner)
    partnerRedirectDisclosure.onOpen()
  }

  return (
    <Noise backgroundColor="background.level0WithOpacity">
      <DefaultPageContainer noVerticalPadding py={['3xl', '10rem']}>
        <VStack alignItems="center" spacing="md" textAlign="center">
          <WordsPullUp
            as="h2"
            color="font.primary"
            fontSize="4xl"
            fontWeight="bold"
            lineHeight={1}
            text="Grow with us."
          />
          <FadeIn delay={0.4} direction="up" duration={1}>
            <Text color="font.secondary" fontSize={{ base: 'lg', lg: '2xl' }} maxW="2xl">
              Balancer v3 is DeFi infrastructure to be built on.
              {isMobile ? <>&nbsp;</> : <br />}
              Our growth is your growth.
            </Text>
          </FadeIn>
        </VStack>
        <Grid gap="md" mt="2xl" templateColumns="repeat(12, 1fr)" templateRows="repeat(3, 1fr)">
          <GridItem colSpan={{ base: 12, lg: 4 }} order={1}>
            <FeatureCard
              radialPatternProps={{
                innerHeight: 100,
                innerWidth: 100,
                height: 200,
                width: 200,
                circleCount: 6,
              }}
              stat={fNumCustom(protocolData.protocolMetricsAggregated.totalLiquidity, '$0,0.0a')}
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="TVL"
              titleSize="2xl"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, lg: 4 }} order={2}>
            <FeatureCard
              radialPatternProps={{
                innerHeight: 100,
                innerWidth: 100,
                height: 200,
                width: 200,
                circleCount: 6,
              }}
              stat={fNumCustom(protocolData.protocolMetricsAggregated.poolCount, '0,0.0a')}
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="Pools"
              titleSize="2xl"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, lg: 4 }} order={3}>
            <FeatureCard
              radialPatternProps={{
                innerHeight: 100,
                innerWidth: 100,
                height: 200,
                width: 200,
                circleCount: 6,
              }}
              stat={fNumCustom(protocolData.protocolMetricsAggregated.swapVolume24h, '$0,0a')}
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="24hr Volume"
              titleSize="2xl"
            />
          </GridItem>
          <GridItem colSpan={{ base: 6, lg: 2 }} order={4}>
            <PartnerButton
              icon={<CowIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.CoW)}
            />
          </GridItem>
          <GridItem colSpan={{ base: 6, lg: 2 }} order={5}>
            <PartnerButton
              icon={<AuraIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Aura)}
            />
          </GridItem>
          <GridItem colSpan={{ base: 6, lg: 2 }} order={6}>
            <PartnerButton
              icon={<BeetsIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Beets)}
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, lg: 6 }} order={{ base: 10, lg: 7 }} rowSpan={2}>
            <FeatureCard
              h="full"
              radialPatternProps={{
                innerHeight: 100,
                innerWidth: 100,
                height: isMobile ? 200 : 250,
                width: isMobile ? 200 : 250,
                circleCount: isMobile ? 6 : 8,
              }}
              stat="10+"
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              subTitle="Instant volume for your liquidity."
              title="Aggregator Integrations"
              titleSize="3xl"
            />
          </GridItem>
          <GridItem colSpan={{ base: 6, lg: 2 }} order={{ base: 7, lg: 8 }}>
            <PartnerButton
              icon={<GyroIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Gyro)}
            />
          </GridItem>
          <GridItem colSpan={{ base: 6, lg: 2 }} order={{ base: 8, lg: 9 }}>
            <PartnerButton
              icon={<XaveIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Xave)}
            />
          </GridItem>
          <GridItem colSpan={{ base: 6, lg: 2 }} order={{ base: 9, lg: 10 }}>
            <PartnerButton
              icon={<QuantAmmIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.QuantAmm)}
            />
          </GridItem>
        </Grid>
        <Text color="font.secondary" fontSize="sm" mt="md">
          *Data includes liquidity and volume on Balancer v2, v3 & CoW AMM.
        </Text>
      </DefaultPageContainer>
      <PartnerRedirectModal
        isOpen={partnerRedirectDisclosure.isOpen}
        onClose={partnerRedirectDisclosure.onClose}
        partner={redirectPartner}
      />
    </Noise>
  )
}
