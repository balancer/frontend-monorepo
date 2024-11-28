'use client'

import {
  Box,
  BoxProps,
  Button,
  Card,
  Grid,
  GridItem,
  Heading,
  HStack,
  VStack,
  Text,
  Center,
} from '@chakra-ui/react'
import { PlayVideoButton } from '@repo/lib/shared/components/btns/PlayVideoButton'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { ReactNode } from 'react'
import { ArrowUpRight } from 'react-feather'
import NextLink from 'next/link'
import { SandBg } from './shared/SandBg'

export function VideoBox({
  label,
  labelProps = {},
  bgVariant,
  ...props
}: BoxProps & { label?: string | ReactNode; labelProps?: BoxProps; bgVariant?: 1 | 2 | 3 }) {
  return (
    <Box
      background="background.level0"
      overflow="hidden"
      position="relative"
      rounded="md"
      shadow="md"
      {...props}
    >
      {bgVariant && <SandBg variant={bgVariant} />}
      <Center h="full" position="absolute" w="full">
        <PlayVideoButton size={62} />
      </Center>
      <Box
        bottom="0"
        left="0"
        p="md"
        position="absolute"
        right="0"
        textAlign="center"
        {...labelProps}
      >
        {label}
      </Box>
    </Box>
  )
}

export function Videos() {
  return (
    <Noise backgroundColor="background.level0WithOpacity">
      <DefaultPageContainer>
        <VStack align="start" spacing="lg" w="full">
          <HStack align="end" justify="space-between" w="full">
            <Heading>Code walkthroughs</Heading>
            <Button
              as={NextLink}
              href="https://github.com/balancer/scaffold-balancer-v3"
              rightIcon={<ArrowUpRight />}
              variant="secondary"
            >
              Prototype on v3
            </Button>
          </HStack>
          <Card>
            <VideoBox
              label={
                <Text fontSize="xl" fontWeight="bold">
                  Create Custom AMMs on Balancer v3
                </Text>
              }
              mb="md"
              minH="500px"
            />
            <Grid gap="md" templateColumns="repeat(3, 1fr)">
              <GridItem>
                <VideoBox
                  bgVariant={1}
                  label={
                    <Text fontSize="md" fontWeight="bold">
                      Prototype v3 on Scaffold Balancer
                    </Text>
                  }
                  minH="200px"
                />
              </GridItem>
              <GridItem>
                <VideoBox
                  bgVariant={2}
                  label={
                    <Text fontSize="md" fontWeight="bold">
                      Create a Hook on Balancer v3
                    </Text>
                  }
                  minH="200px"
                />
              </GridItem>
              <GridItem>
                <VideoBox
                  bgVariant={3}
                  label={
                    <Text fontSize="md" fontWeight="bold">
                      Create a Router on Balancer v3
                    </Text>
                  }
                  minH="200px"
                />
              </GridItem>
            </Grid>
          </Card>
        </VStack>
      </DefaultPageContainer>
    </Noise>
  )
}
