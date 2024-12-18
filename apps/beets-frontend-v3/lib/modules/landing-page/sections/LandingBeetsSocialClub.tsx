'use client'

import { useNavData } from '@/lib/components/navs/useNavData'
import { Box, Center, HStack, IconButton, Link, Text } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { AppLink } from '@repo/lib/shared/components/navs/useNav'

function SocialLinks({ socialLinks }: { socialLinks: AppLink[] }) {
  return (
    <HStack spacing="lg">
      {socialLinks.map(({ href, icon }) => (
        <IconButton
          aria-label="Social icon"
          as={Link}
          bg="background.level2"
          h="72px"
          href={href}
          isExternal
          isRound
          key={href}
          rounded="full"
          variant="tertiary"
          w="72px"
        >
          {icon}
        </IconButton>
      ))}
    </HStack>
  )
}

export function LandingBeetsSocialClub() {
  const { getSocialLinks } = useNavData()
  const socialLinks = getSocialLinks(36)

  return (
    <>
      <DefaultPageContainer noVerticalPadding pb="3xl">
        <Box
          height="140px"
          backgroundImage="url(/images/misc/beets-social-club.png)"
          backgroundSize="auto 100%"
          backgroundRepeat="no-repeat"
          backgroundPosition="center"
          mb="2xl"
        />
        <Center mb="2xl">
          <Text fontSize="2xl" fontWeight="thin" maxW="full" w="2xl" textAlign="center">
            Join our vibrant community of DeFi enthusiasts, builders, and visionaries. Share
            insights, collaborate on projects, and help shape the BEETS ecosystem together. Connect,
            learn, and grow with us.
          </Text>
        </Center>
        <Center>
          <SocialLinks socialLinks={socialLinks} />
        </Center>
      </DefaultPageContainer>
    </>
  )
}
