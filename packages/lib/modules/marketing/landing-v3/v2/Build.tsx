'use client'

/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Box,
  Button,
  Card,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Image from 'next/image'

// @ts-ignore
import bgSrc from './images/circles-right.svg'
import { Code } from 'react-feather'
import { AddIcon } from '@chakra-ui/icons'

function ContractCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <VStack alignItems="start" spacing="lg" w="full">
        <HStack alignItems="center" justifyContent="space-between" w="full">
          <HStack>
            <Box color="font.secondary">
              <Code size={16} />
            </Box>
            <Text color="font.secondary">Smart contract</Text>
          </HStack>
          <IconButton
            aria-label="Expand"
            fontSize="12px"
            h="30px"
            icon={<AddIcon />}
            isRound
            size="xs"
            variant="primary"
            w="30px"
          />
        </HStack>
        <VStack alignItems="start" mb="lg" w="80%">
          <Text fontSize="xl" fontWeight="bold">
            {title}
          </Text>
          <Text color="font.secondary">{description}</Text>
        </VStack>
      </VStack>
    </Card>
  )
}

export function Build() {
  return (
    <Box position="relative">
      <Box bottom={0} left={0} opacity={0.4} position="absolute" right={0} top={300} w="45vw">
        <Image
          alt="background"
          fill
          sizes="100vw"
          src={bgSrc}
          style={{ objectFit: 'contain', objectPosition: 'left' }}
        />
      </Box>
      <DefaultPageContainer minH="800px" noVerticalPadding position="relative" py="3xl">
        <Grid gap="xl" templateColumns="repeat(2, 1fr)">
          <GridItem>
            <VStack alignItems="start" spacing="md">
              <Heading as="h3" size="xl">
                Building on v3 is easy
              </Heading>
              <Text color="font.secondary" fontSize="lg">
                Balancer v3’s architecture focuses on simplicity, flexibility, and extensibility at
                its core. The v3 vault more formally defines the requirements of a custom pool,
                shifting core design patterns out of the pool and into the vault.
              </Text>
            </VStack>
          </GridItem>
          <GridItem />
        </Grid>
        <Grid gap="xl" templateColumns="repeat(2, 1fr)">
          <GridItem />
          <GridItem borderRadius="lg">
            <VStack alignItems="start" spacing="md">
              <Heading as="h4" size="lg">
                Contracts
              </Heading>
              <Text color="font.secondary" fontSize="lg">
                The four main contracts of Balancer v3 enhance flexibility and minimize the
                intricacies involved in constructing pools, empowering builders to focus on
                innovation rather than grappling with complex code.
              </Text>
            </VStack>
            <Grid gap="md" mt="2xl" templateColumns="repeat(2, 1fr)" templateRows="repeat(2, 1fr)">
              <GridItem>
                <ContractCard description="Entry-point for all pool operations" title="Router" />
              </GridItem>
              <GridItem>
                <ContractCard description="Handles math for pool operations" title="Pool" />
              </GridItem>
              <GridItem>
                <ContractCard description="Handles accounting & holds tokens" title="Vault" />
              </GridItem>
              <GridItem>
                <ContractCard
                  description="Can execute actions before and/or after pool does math"
                  title="Hook"
                />
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </DefaultPageContainer>
    </Box>
  )
}
