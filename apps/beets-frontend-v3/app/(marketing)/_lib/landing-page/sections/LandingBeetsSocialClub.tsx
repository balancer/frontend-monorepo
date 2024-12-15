'use client'

import React from 'react'
import {
  Box,
  Button,
  Center,
  Grid,
  GridItem,
  Heading,
  HStack,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { LudwigSocial1 } from '../components/LudwigSocial1'
import { LudwigSocial2 } from '../components/LudwigSocial2'
import { LudwigSocial3 } from '../components/LudwigSocial3'
import { LudwigSocial4 } from '../components/LudwigSocial4'
import { LudwigSocial5 } from '../components/LudwigSocial5'
import { DiscordIcon } from '@repo/lib/shared/components/icons/social/DiscordIcon'
import NextLink from 'next/link'

export function LandingBeetsSocialClub() {
  return (
    <>
      <DefaultPageContainer noVerticalPadding pb="3xl">
        <HStack justifyContent="center" spacing="lg" mb="2xl">
          <Box opacity={0.2}>
            <LudwigSocial1 />
          </Box>
          <Box opacity={0.2}>
            <LudwigSocial2 />
          </Box>
          <Box>Beets social club</Box>
          <Box opacity={0.2}>
            <LudwigSocial3 />
          </Box>
          <Box opacity={0.2}>
            <LudwigSocial4 />
          </Box>
          <Box opacity={0.2}>
            <LudwigSocial5 />
          </Box>
        </HStack>
        <Center mb="lg">
          <Text fontSize="2xl" fontWeight="thin" maxW="full" w="2xl" textAlign="center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a ultrices
            dapibus. Maecenas sit amet lectus tortor. Nam luctus eros leo. Ut porttitor posuere
            feugiat. Vivamus ut velit sed lacus pretium porta. Mauris nec dui vel tellus tempor.
          </Text>
        </Center>
        <Center mb="lg">
          <DiscordIcon size={80} />
        </Center>

        <Center>
          <Button
            as={NextLink}
            href="https://beets.fi/discord"
            size="lg"
            variant="primary"
            target="_blank"
          >
            beets.fi/discord
          </Button>
        </Center>
      </DefaultPageContainer>
    </>
  )
}
