/* eslint-disable max-len */

import { MotionValue, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { Box, BoxProps, Flex, Text, useDisclosure, VStack } from '@chakra-ui/react'
import { BeetsIcon } from '@repo/lib/shared/components/icons/logos/BeetsIcon'
import { AaveIcon } from '@repo/lib/shared/components/icons/logos/AaveIcon'
import { AuraIcon } from '@repo/lib/shared/components/icons/logos/AuraIcon'
import { CowIcon } from '@repo/lib/shared/components/icons/logos/CowIcon'
import { GyroIcon } from '@repo/lib/shared/components/icons/logos/GyroIcon'
import { CronIcon } from '@repo/lib/shared/components/icons/logos/CronIcon'
import { XaveIcon } from '@repo/lib/shared/components/icons/logos/XaveIcon'
import { FjordIcon } from '@repo/lib/shared/components/icons/logos/FjordIcon'
import { PartnerRedirectModal, RedirectPartner } from '../modals/PartnerRedirectModal'

export function HomeCaseStudies() {
  const [redirectPartner, setRedirectPartner] = useState<RedirectPartner>(RedirectPartner.Aura)
  const mouseX = useMotionValue(Infinity)

  const partnerRedirectDisclosure = useDisclosure()

  const logos = [
    { icon: CowIcon, name: 'Cow', partner: RedirectPartner.CoW },
    { icon: AuraIcon, name: 'Aura', partner: RedirectPartner.Aura },
    { icon: BeetsIcon, name: 'Beets', partner: RedirectPartner.Beets },
    { icon: AaveIcon, name: 'Aave', partner: RedirectPartner.Aave },
    { icon: GyroIcon, name: 'Gyro', partner: RedirectPartner.Gyro },
    { icon: XaveIcon, name: 'Xave', partner: RedirectPartner.Xave },
    { icon: CronIcon, name: 'Cron', partner: RedirectPartner.Cron },
    { icon: FjordIcon, name: 'Fjord', partner: RedirectPartner.Fjord },
  ]

  function openRedirectModal(partner: RedirectPartner) {
    setRedirectPartner(partner)
    partnerRedirectDisclosure.onOpen()
  }

  return (
    <Box overflowX="hidden">
      <VStack
        alignItems={{ base: 'flex-start', md: 'center' }}
        px={['ms', 'md']}
        py={['xl', 'xl']}
        w="full"
      >
        <Text>Top DeFi protocols build with Balancer</Text>
        <Flex display={{ base: 'none', md: 'flex' }} justifyContent="center">
          <Box h="54px" position="relative" />
          <Box bottom="20px" position="absolute">
            <Box
              alignItems="flex-end"
              as={motion.div}
              display="flex"
              flexWrap="wrap"
              gap="sm"
              justifyContent="center"
              mx="auto"
              onMouseLeave={() => mouseX.set(Infinity)}
              onMouseMove={e => mouseX.set(e.pageX)}
            >
              {logos.map((logo, i) => (
                <AppIcon
                  Icon={logo.icon}
                  key={i}
                  mouseX={mouseX}
                  name={logo.name}
                  onClick={() => openRedirectModal(logo.partner)}
                />
              ))}
            </Box>
          </Box>
        </Flex>
        <Flex
          display={{ base: 'flex', md: 'none' }}
          flexWrap="wrap"
          gap="ms"
          justifyContent="flex-start"
          pt="sm"
        >
          {logos.map((logo, i) => (
            <SmallIcon
              Icon={logo.icon}
              key={i}
              name={logo.name}
              onClick={() => openRedirectModal(logo.partner)}
            />
          ))}
        </Flex>
      </VStack>
      <PartnerRedirectModal
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
  Icon: React.ComponentType
  name: string
} & BoxProps) {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseX, val => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(distance, [-150, -50, 0, 50, 150], [60, 100, 100, 100, 60])
  const width = useSpring(widthSync, { mass: 1, stiffness: 100, damping: 20 })

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
      ref={ref}
      shadow="sm"
      style={{ width }}
      title={name}
      transition="color 0.3s ease-out, background-color 0.3s ease-out, box-shadow 0.3s ease-out"
      w="200px"
      willChange="box-shadow, background-color"
      {...rest}
    >
      <Icon />
    </Box>
  )
}

function SmallIcon({
  Icon,
  name,
  ...rest
}: { Icon: React.ComponentType; name: string } & BoxProps) {
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
      shadow="sm"
      title={name}
      transition="color 0.3s ease-out, background-color 0.3s ease-out, box-shadow 0.3s ease-out, transform 0.3s ease-out"
      w="60px"
      willChange="box-shadow, background-color"
      {...rest}
    >
      <Icon />
    </Box>
  )
}
