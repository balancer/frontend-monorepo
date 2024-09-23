import { useDisclosure } from '@chakra-ui/hooks'
import {
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  VStack,
  Link,
  Divider,
  Box,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { ArrowUpRight, Menu } from 'react-feather'
import { BalancerLogoType } from '../imgs/BalancerLogoType'
import { useNav } from './useNav'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { VeBalLink } from '@/lib/modules/vebal/VebalRedirectModal'

function NavLinks({ onClick }: { onClick?: () => void }) {
  const { appLinks, linkColorFor } = useNav()

  return (
    <VStack align="start" w="full">
      {appLinks.map(link => (
        <Link
          key={link.href}
          as={NextLink}
          href={link.href}
          prefetch={true}
          variant="nav"
          color={linkColorFor(link.href)}
          onClick={onClick}
          fontSize="xl"
        >
          {link.label}
        </Link>
      ))}
      <VeBalLink fontSize="xl" />
    </VStack>
  )
}

function EcosystemLinks() {
  const { ecosystemLinks } = useNav()

  return (
    <VStack align="start" w="full">
      <Text color="grayText" size="xs" mb="sm">
        Ecosystem
      </Text>
      {ecosystemLinks.map(link => (
        <Link
          key={link.href}
          href={link.href}
          variant="nav"
          isExternal
          display="flex"
          alignItems="center"
          gap="xs"
        >
          {link.label}
          <Box color="grayText">
            <ArrowUpRight size={14} />
          </Box>
        </Link>
      ))}
    </VStack>
  )
}

function SocialLinks() {
  const { getSocialLinks } = useNav()

  return (
    <HStack justify="space-between" w="full">
      {getSocialLinks().map(({ href, icon }) => (
        <Button as={Link} key={href} href={href} variant="tertiary" isExternal>
          {icon}
        </Button>
      ))}
    </HStack>
  )
}

export function MobileNav() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef(null)
  const router = useRouter()

  function hommRedirect() {
    onClose()
    router.push('/')
  }

  return (
    <>
      <Button ref={btnRef} variant="tertiary" onClick={onOpen}>
        <Menu size={18} />
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <BalancerLogoType width="106px" onClick={hommRedirect} />
          </DrawerHeader>

          <DrawerBody>
            <NavLinks onClick={onClose} />
            <Divider my={4} />
            <EcosystemLinks />
          </DrawerBody>

          <DrawerFooter>
            <SocialLinks />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
