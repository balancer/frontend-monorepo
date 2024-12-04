'use client'

import {
  Heading,
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
import { FeatureCard } from './Build'
import { BeetsIcon } from '@repo/lib/shared/components/icons/logos/BeetsIcon'
import { CowIcon } from '@repo/lib/shared/components/icons/logos/CowIcon'
import { AuraIcon } from '@repo/lib/shared/components/icons/logos/AuraIcon'
import { GyroIcon } from '@repo/lib/shared/components/icons/logos/GyroIcon'
import { XaveIcon } from '@repo/lib/shared/components/icons/logos/XaveIcon'
import { CronIcon } from '@repo/lib/shared/components/icons/logos/CronIcon'
import { ReactNode, useState } from 'react'
import {
  PartnerRedirectModal,
  RedirectPartner,
} from '@repo/lib/shared/components/modals/PartnerRedirectModal'

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

  function openRedirectModal(partner: RedirectPartner) {
    setRedirectPartner(partner)
    partnerRedirectDisclosure.onOpen()
  }

  return (
    <Noise>
      <DefaultPageContainer>
        <VStack alignItems="center" spacing="md" textAlign="center">
          <Heading as="h3" size="xl">
            Grow with us.
          </Heading>
          <Text color="font.secondary" fontSize="2xl" maxW="2xl">
            Balancer v3 is DeFi infrastructure to be built on.
            <br />
            Our growth is your growth.
          </Text>
        </VStack>
        <Grid gap="md" mt="2xl" templateColumns="repeat(12, 1fr)" templateRows="repeat(3, 1fr)">
          <GridItem colSpan={4}>
            <FeatureCard
              radialPatternProps={{
                innerHeight: 100,
                innerWidth: 100,
                height: 200,
                width: 200,
              }}
              stat="$1.1B"
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="TVL"
              titleSize="3xl"
            />
          </GridItem>
          <GridItem colSpan={4}>
            <FeatureCard
              radialPatternProps={{
                innerHeight: 100,
                innerWidth: 100,
                height: 200,
                width: 200,
              }}
              stat="4K+"
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="Pools"
              titleSize="3xl"
            />
          </GridItem>
          <GridItem colSpan={4}>
            <FeatureCard
              radialPatternProps={{
                innerHeight: 100,
                innerWidth: 100,
                height: 200,
                width: 200,
              }}
              stat="$54M"
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="24hr Volume"
              titleSize="3xl"
            />
          </GridItem>
          <GridItem colSpan={2}>
            <PartnerButton
              icon={<CowIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.CoW)}
            />
          </GridItem>
          <GridItem colSpan={2}>
            <PartnerButton
              icon={<AuraIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Aura)}
            />
          </GridItem>
          <GridItem colSpan={2}>
            <PartnerButton
              icon={<BeetsIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Beets)}
            />
          </GridItem>
          <GridItem colSpan={6} rowSpan={2}>
            <FeatureCard
              h="full"
              radialPatternProps={{
                innerHeight: 100,
                innerWidth: 100,
                height: 250,
                width: 250,
              }}
              stat="10+"
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              subTitle="Instant volume for your liquidity."
              title="Aggregator Integrations"
              titleSize="3xl"
            />
          </GridItem>
          <GridItem colSpan={2}>
            <PartnerButton
              icon={<GyroIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Gyro)}
            />
          </GridItem>
          <GridItem colSpan={2}>
            <PartnerButton
              icon={<XaveIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Xave)}
            />
          </GridItem>
          <GridItem colSpan={2}>
            <PartnerButton
              icon={<CronIcon size={80} />}
              onClick={() => openRedirectModal(RedirectPartner.Cron)}
            />
          </GridItem>
        </Grid>
      </DefaultPageContainer>
      <PartnerRedirectModal
        isOpen={partnerRedirectDisclosure.isOpen}
        onClose={partnerRedirectDisclosure.onClose}
        partner={redirectPartner}
      />
    </Noise>
  )
}
