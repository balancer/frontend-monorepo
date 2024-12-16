'use client'

import { Box, Flex, Grid, GridItem, Heading, Text } from '@chakra-ui/react'
import React from 'react'
import { LandingSectionContainer } from '../components/LandingSectionContainer'
import { SecurityAuditsSvg } from '../components/SecurityAuditsSvg'
import { SecurityMonitoringSvg } from '../components/SecurityMonitoringSvg'
import { SecurityOpenSourceSvg } from '../components/SecurityOpenSourceSvg'

function Card({
  title,
  description,
  image,
}: {
  title: React.ReactNode
  description: string
  image: React.ReactNode
}) {
  return (
    <GridItem mb={{ base: 'lg', lg: 'none' }}>
      <Flex mb="md">
        <Box flex="1">
          <Heading fontSize="2xl">{title}</Heading>
        </Box>
        {image}
      </Flex>
      <Text fontSize="lg" fontWeight="thin">
        {description}
      </Text>
    </GridItem>
  )
}

export function LandingBeetsSecuritySection() {
  return (
    <LandingSectionContainer
      title="Code you can trust"
      subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a ultrices
            dapibus. Maecenas sit amet lectus tortor. Nam luctus eros leo."
      button={{
        text: 'Learn more',
        href: '',
      }}
    >
      <Box bg="rgba(255, 255, 255, 0.05)" p="xl" w="full">
        <Grid
          gap="lg"
          templateColumns={{
            base: '1fr',
            lg: '1fr 1fr 1fr',
          }}
        >
          <Card
            title={
              <>
                Rigorous
                <br />
                Audits
              </>
            }
            description="Our code is thoroughly audited by leading security firms."
            image={<SecurityAuditsSvg />}
          />
          <Card
            title={
              <>
                Open-Source
                <br />
                Transparency
              </>
            }
            description="All code is publicly available for community scrutiny and trust."
            image={<SecurityOpenSourceSvg />}
          />
          <Card
            title={
              <>
                Continous
                <br />
                Monitoring
              </>
            }
            description="Ongoing security assessments ensure the integrity of the beets ecosystem."
            image={<SecurityMonitoringSvg />}
          />
        </Grid>
      </Box>
    </LandingSectionContainer>
  )
}
