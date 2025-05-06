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
import { ReactNode, useRef, useState } from 'react'
import {
  PartnerRedirectModal,
  RedirectPartner,
} from '@repo/lib/shared/components/modals/PartnerRedirectModal'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { FeatureCard } from './shared/FeatureCard'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'
import { FadeIn } from '@repo/lib/shared/components/animations/FadeIn'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { motion, useInView } from 'framer-motion'
import { useProtocolStats } from '@repo/lib/modules/protocol/ProtocolStatsProvider'

const MotionGrid = motion(Grid)
const MotionGridItem = motion(GridItem)

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

export function Grow() {
  const [redirectPartner, setRedirectPartner] = useState<RedirectPartner>(RedirectPartner.Aura)
  const partnerRedirectDisclosure = useDisclosure()
  const { isMobile } = useBreakpoints()
  const { protocolData } = useProtocolStats()

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  function openRedirectModal(partner: RedirectPartner) {
    setRedirectPartner(partner)
    partnerRedirectDisclosure.onOpen()
  }

  const gridVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const gridItemVariants = {
    show: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
    hidden: { opacity: 0, filter: 'blur(3px)', scale: 0.95, y: 15 },
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
            letterSpacing="-0.04rem"
            lineHeight={1}
            text="Grow with us"
          />
          <FadeIn delay={0.2} direction="up" duration={0.6}>
            <Text color="font.secondary" fontSize="lg" maxW="2xl">
              Balancer v3 is DeFi infrastructure to be built on.
              {isMobile ? <>&nbsp;</> : <br />}
              Our growth is your growth.
            </Text>
          </FadeIn>
        </VStack>
        <MotionGrid
          animate={isInView ? 'show' : 'hidden'}
          gap="md"
          initial="hidden"
          mt="2xl"
          ref={ref}
          templateColumns="repeat(12, 1fr)"
          templateRows="repeat(3, 1fr)"
          variants={gridVariants}
        >
          <MotionGridItem colSpan={{ base: 12, lg: 4 }} order={1} variants={gridItemVariants}>
            <FeatureCard
              radialPatternProps={{
                innerHeight: 100,
                innerWidth: 100,
                height: 200,
                width: 200,
                circleCount: 6,
              }}
              stat={fNumCustom(
                protocolData?.protocolMetricsAggregated.totalLiquidity ?? 0,
                '$0,0.0a'
              )}
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="TVL"
              titleSize="2xl"
            />
          </MotionGridItem>
          <MotionGridItem colSpan={{ base: 12, lg: 4 }} order={2} variants={gridItemVariants}>
            <FeatureCard
              radialPatternProps={{
                innerHeight: 100,
                innerWidth: 100,
                height: 200,
                width: 200,
                circleCount: 6,
              }}
              stat={fNumCustom(protocolData?.protocolMetricsAggregated.poolCount ?? 0, '0,0.0a')}
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="Pools"
              titleSize="2xl"
            />
          </MotionGridItem>
          <MotionGridItem colSpan={{ base: 12, lg: 4 }} order={3} variants={gridItemVariants}>
            <FeatureCard
              radialPatternProps={{
                innerHeight: 100,
                innerWidth: 100,
                height: 200,
                width: 200,
                circleCount: 6,
              }}
              stat={fNumCustom(protocolData?.protocolMetricsAggregated.swapVolume24h ?? 0, '$0,0a')}
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="24hr volume"
              titleSize="2xl"
            />
          </MotionGridItem>
          <MotionGridItem colSpan={{ base: 6, lg: 2 }} order={4} variants={gridItemVariants}>
            <PartnerButton
              icon={<CowIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.CoW)}
            />
          </MotionGridItem>
          <MotionGridItem colSpan={{ base: 6, lg: 2 }} order={5} variants={gridItemVariants}>
            <PartnerButton
              icon={<AuraIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Aura)}
            />
          </MotionGridItem>
          <MotionGridItem colSpan={{ base: 6, lg: 2 }} order={6} variants={gridItemVariants}>
            <PartnerButton
              icon={<BeetsIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Beets)}
            />
          </MotionGridItem>
          <MotionGridItem
            colSpan={{ base: 12, lg: 6 }}
            order={{ base: 10, lg: 7 }}
            rowSpan={2}
            variants={gridItemVariants}
          >
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
              subTitle="Instant volume for your liquidity"
              title="Aggregator Integrations"
              titleSize="3xl"
            />
          </MotionGridItem>
          <MotionGridItem
            colSpan={{ base: 6, lg: 2 }}
            order={{ base: 7, lg: 8 }}
            variants={gridItemVariants}
          >
            <PartnerButton
              icon={<GyroIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Gyro)}
            />
          </MotionGridItem>
          <MotionGridItem
            colSpan={{ base: 6, lg: 2 }}
            order={{ base: 8, lg: 9 }}
            variants={gridItemVariants}
          >
            <PartnerButton
              icon={<XaveIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Xave)}
            />
          </MotionGridItem>
          <MotionGridItem
            colSpan={{ base: 6, lg: 2 }}
            order={{ base: 9, lg: 10 }}
            variants={gridItemVariants}
          >
            <PartnerButton
              icon={<QuantAmmIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.QuantAmm)}
            />
          </MotionGridItem>
        </MotionGrid>
        <Text color="font.secondary" fontSize="sm" mt="xl">
          * Data includes liquidity and volume on Balancer v2, v3 & CoW AMM.
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
