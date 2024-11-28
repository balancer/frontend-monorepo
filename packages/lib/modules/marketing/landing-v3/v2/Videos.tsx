/* eslint-disable @typescript-eslint/ban-ts-comment */
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
import Image from 'next/image'

// @ts-ignore
import bgCirclesSrc from './images/circles-right.svg'
import { useIsDarkMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'

export function VideoBox({
  label,
  labelProps = {},
  bgVariant,
  url,
  ...props
}: BoxProps & {
  label?: string | ReactNode
  labelProps?: BoxProps
  bgVariant?: 1 | 2 | 3
  url: string
}) {
  return (
    <NextLink href={url} rel="noopener noreferrer" target="_blank">
      <Box
        background="background.level0"
        overflow="hidden"
        position="relative"
        rounded="md"
        shadow="md"
        target="_blank"
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
    </NextLink>
  )
}

export function Videos() {
  const isDarkMode = useIsDarkMode()

  return (
    <Noise backgroundColor="background.level0WithOpacity">
      <Box minH="500px" position="absolute" w="full">
        <Box
          bottom={0}
          h="500px"
          left={0}
          opacity={isDarkMode ? 0.1 : 0.4}
          position="absolute"
          top={0}
          w="100vw"
        >
          <Image
            alt="background"
            fill
            sizes="100vw"
            src={bgCirclesSrc}
            style={{ objectFit: 'contain', objectPosition: 'left', rotate: '180deg' }}
          />
        </Box>
      </Box>
      <DefaultPageContainer noVerticalPadding pt="200px">
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
              url="https://youtu.be/oJAXQCMVdfA?si=Vnusjr2rzGVLI4Lm"
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
                  url="https://youtu.be/m6q5M34ZdXw?si=FfZhc6fQRHht3JME"
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
                  url="https://youtu.be/kaz6duliRPA?si=CMTRINvkDwrR-7s-"
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
                  url="https://youtu.be/pO1ChmSFTaY?si=6wRUk2Ff5yJyGrIn"
                />
              </GridItem>
            </Grid>
          </Card>
        </VStack>
      </DefaultPageContainer>
    </Noise>
  )
}
