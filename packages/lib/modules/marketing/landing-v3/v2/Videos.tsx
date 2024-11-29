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
import { useIsDarkMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'

// @ts-ignore
import bgCirclesSrc from './images/circles-right.svg'
// @ts-ignore
import createCustomAMMsSrc from './images/video-createCustomAMMs.png'
// @ts-ignore
import scaffoldBalancerSrc from './images/video-scaffoldBalancer.png'
// @ts-ignore
import createHookSrc from './images/video-createHook.png'
// @ts-ignore
import createRouterSrc from './images/video-createRouter.png'

const videos = {
  createCustomAMMs: {
    title: 'Create Custom AMMs on Balancer v3',
    url: 'https://youtu.be/oJAXQCMVdfA?si=Vnusjr2rzGVLI4Lm',
    src: createCustomAMMsSrc,
  },
  scaffoldBalancer: {
    title: 'Prototype v3 on Scaffold Balancer',
    url: 'https://youtu.be/m6q5M34ZdXw?si=FfZhc6fQRHht3JME',
    src: scaffoldBalancerSrc,
  },
  createHook: {
    title: 'Create a Hook on Balancer v3',
    url: 'https://youtu.be/kaz6duliRPA?si=CMTRINvkDwrR-7s-',
    src: createHookSrc,
  },
  createRouter: {
    title: 'Create a Router on Balancer v3',
    url: 'https://youtu.be/pO1ChmSFTaY?si=6wRUk2Ff5yJyGrIn',
    src: createRouterSrc,
  },
}

export function VideoBox({
  label,
  labelProps = {},
  bgVariant,
  id,
  feature = false,
  ...props
}: BoxProps & {
  label?: string | ReactNode
  labelProps?: BoxProps
  bgVariant?: 1 | 2 | 3
  id: keyof typeof videos
  feature?: boolean
}) {
  const video = videos[id]

  return (
    <NextLink href={video.url} rel="noopener noreferrer" role="group" target="_blank">
      <Box
        background="background.level0"
        overflow="hidden"
        position="relative"
        rounded="md"
        shadow="md"
        target="_blank"
        {...props}
      >
        {feature && (
          <>
            <Image
              alt="initial frame"
              fill
              src={video.src}
              style={{
                objectFit: 'cover',
              }}
            />
            <Box
              _groupHover={{ opacity: 0.8 }}
              bg="background.base"
              h="full"
              opacity={0.9}
              position="absolute"
              transition="opacity 0.4s ease-in-out"
              w="full"
            />
          </>
        )}
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
            <Heading>Learn to build on v3</Heading>
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
              feature
              id="createCustomAMMs"
              label={
                <Text fontSize="xl" fontWeight="bold">
                  {videos.createCustomAMMs.title}
                </Text>
              }
              mb="md"
              minH="600px"
            />
            <Grid gap="md" templateColumns="repeat(3, 1fr)">
              <GridItem>
                <VideoBox
                  bgVariant={1}
                  id="scaffoldBalancer"
                  label={
                    <Text fontSize="md" fontWeight="bold">
                      {videos.scaffoldBalancer.title}
                    </Text>
                  }
                  minH="200px"
                />
              </GridItem>
              <GridItem>
                <VideoBox
                  bgVariant={2}
                  id="createHook"
                  label={
                    <Text fontSize="md" fontWeight="bold">
                      {videos.createHook.title}
                    </Text>
                  }
                  minH="200px"
                />
              </GridItem>
              <GridItem>
                <VideoBox
                  bgVariant={3}
                  id="createRouter"
                  label={
                    <Text fontSize="md" fontWeight="bold">
                      {videos.createRouter.title}
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
