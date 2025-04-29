/* eslint-disable max-len */

import { MotionValue, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ReactNode, useRef, useState } from 'react'
import { Box, BoxProps, Flex, Text, useDisclosure, VStack, Stack, Heading } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { HiddenhandIcon } from '@repo/lib/shared/components/icons/logos/HiddenhandIcon'
import { StakedaoIcon } from '@repo/lib/shared/components/icons/logos/StakedaoIcon'
import { AuraIcon } from '@repo/lib/shared/components/icons/logos/AuraIcon'
import { PaladinIcon } from '@repo/lib/shared/components/icons/logos/PaladinIcon'
import { Picture } from '@repo/lib/shared/components/other/Picture'

import {
  VebalPartnerRedirectModal,
  VebalRedirectPartner,
} from '@repo/lib/shared/components/modals/VebalPartnerRedirectModal'

export function VebalEcosystem() {
  const [redirectPartner, setRedirectPartner] = useState<VebalRedirectPartner>(
    VebalRedirectPartner.Aura
  )
  const mouseX = useMotionValue(Infinity)

  const partnerRedirectDisclosure = useDisclosure()

  const logos = [
    { icon: AuraIcon, name: 'Aura', partner: VebalRedirectPartner.Aura, size: 48 },
    {
      icon: HiddenhandIcon,
      name: 'Hiddenhand',
      partner: VebalRedirectPartner.HiddenHand,
      size: 48,
    },
    { icon: StakedaoIcon, name: 'Stakedao', partner: VebalRedirectPartner.StakeDAO, size: 48 },
    { icon: PaladinIcon, name: 'Paladin', partner: VebalRedirectPartner.Palladin, size: 48 },
  ]

  function openRedirectModal(partner: VebalRedirectPartner) {
    setRedirectPartner(partner)
    partnerRedirectDisclosure.onOpen()
  }

  return (
    <Box>
      <VStack alignItems="center" px={['ms', 'md']} py={['xl', 'xl']} w="full">
        <FadeInOnView animateOnce={false}>
          <Stack alignItems="center" gap="md" mb="ms" px="md">
            <Heading as="h2" backgroundClip="text" bg="background.gold" pb="0.5" size="lg">
              veBAL ecosystem
            </Heading>
            <Text color="font.secondary" lineHeight="1.4" maxWidth="40ch" pt="0" textAlign="center">
              DeFi platforms have built advanced tools and incentive systems on top of veBAL. Some
              also acquire veBAL to get a share of protocol revenue and to direct BAL emissions.
            </Text>
          </Stack>
        </FadeInOnView>
        <Flex display={{ base: 'none', md: 'flex' }} justifyContent="center" w="full">
          <Box
            alignItems="center"
            as={motion.div}
            display="flex"
            flexWrap="wrap"
            gap="ms"
            justifyContent="center"
            minH="150px"
            mx="auto"
            onMouseLeave={() => mouseX.set(Infinity)}
            onMouseMove={e => mouseX.set(e.pageX)}
            w="full"
          >
            {logos.map(logo => (
              <AppIcon
                Icon={<logo.icon size={logo.size} />}
                key={logo.name.toLowerCase()}
                mouseX={mouseX}
                name={logo.name}
                onClick={() => openRedirectModal(logo.partner)}
              />
            ))}
          </Box>
        </Flex>
        <Flex
          display={{ base: 'flex', md: 'none' }}
          flexWrap="wrap"
          gap="ms"
          justifyContent="center"
          pt="sm"
        >
          {logos.map(logo => (
            <SmallIcon
              Icon={<logo.icon />}
              key={logo.name.toLowerCase()}
              name={logo.name}
              onClick={() => openRedirectModal(logo.partner)}
            />
          ))}
        </Flex>
      </VStack>
      <VebalPartnerRedirectModal
        isOpen={partnerRedirectDisclosure.isOpen}
        onClose={partnerRedirectDisclosure.onClose}
        partner={redirectPartner}
      />
    </Box>
  )
}

function AppIcon({
  mouseX,
  Icon,
  name,
  ...rest
}: {
  mouseX: MotionValue
  Icon: ReactNode
  name: string
} & BoxProps) {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseX, val => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(distance, [-100, -50, 0, 50, 100], [120, 150, 150, 150, 120])
  const width = useSpring(widthSync, { mass: 2, stiffness: 100, damping: 30 })

  return (
    <Box
      _dark={{
        bg: 'background.level2',
        color: 'font.secondary',
        _hover: {
          color: 'font.maxContrast',
          bg: 'background.level4',
          boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.2)',
        },
      }}
      _hover={{
        bg: 'background.level4',
        color: 'brown.500',
        boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.1)',
      }}
      alignItems="center"
      as={motion.div}
      aspectRatio={1}
      bg="background.level2"
      borderRadius="full"
      color="brown.300"
      cursor="pointer"
      display="flex"
      justifyContent="center"
      position="relative"
      ref={ref}
      shadow="sm"
      style={{ width }}
      title={name}
      transition="color 0.3s ease-out, background-color 0.3s ease-out, box-shadow 0.3s ease-out"
      willChange="box-shadow, background-color"
      {...rest}
    >
      <Box
        borderRadius="full"
        inset={0}
        overflow="hidden"
        position="absolute"
        shadow="2xl"
        zIndex={0}
      >
        <Picture
          altText="Background texture"
          defaultImgType="png"
          directory="/images/textures/"
          height="100%"
          imgAvif
          imgAvifDark
          imgAvifPortrait
          imgAvifPortraitDark
          imgName="rock-slate"
          imgPng
          imgPngDark
          width="100%"
        />
      </Box>
      <Box
        alignItems="center"
        display="flex"
        h="full"
        justifyContent="center"
        position="relative"
        w="full"
        zIndex={1}
      >
        {Icon}
      </Box>
    </Box>
  )
}

function SmallIcon({ Icon, name, ...rest }: { Icon: ReactNode; name: string } & BoxProps) {
  return (
    <Box
      _dark={{
        bg: 'background.level2',
        color: 'font.secondary',
        _hover: {
          color: 'font.maxContrast',
          bg: 'background.level4',
          boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.2)',
        },
      }}
      _hover={{
        bg: 'background.level4',
        color: 'brown.500',
        boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.1)',
        transform: 'scale(1.1)',
        transition: 'scale 0.3s ease-out',
      }}
      alignItems="center"
      aspectRatio={1}
      bg="background.level2"
      borderRadius="full"
      color="brown.300"
      cursor="pointer"
      display="flex"
      justifyContent="center"
      position="relative"
      shadow="sm"
      title={name}
      transition="color 0.3s ease-out, background-color 0.3s ease-out, box-shadow 0.3s ease-out, transform 0.3s ease-out"
      w="60px"
      willChange="box-shadow, background-color"
      {...rest}
    >
      <Box borderRadius="full" inset={0} overflow="hidden" position="absolute" zIndex={0}>
        <Picture
          altText="Background texture"
          defaultImgType="png"
          directory="/images/textures/"
          height="100%"
          imgAvif
          imgAvifDark
          imgAvifPortrait
          imgAvifPortraitDark
          imgName="rock-slate"
          imgPng
          imgPngDark
          width="100%"
        />
      </Box>
      <Box
        alignItems="center"
        display="flex"
        h="full"
        justifyContent="center"
        position="relative"
        w="full"
        zIndex={1}
      >
        {Icon}
      </Box>
    </Box>
  )
}
