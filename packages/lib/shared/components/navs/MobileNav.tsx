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
import { AppLink, useNav } from './useNav'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { VeBalLink } from '@repo/lib/modules/vebal/VebalRedirectModal'

type NavLinkProps = {
  appLinks: AppLink[]
  onClick?: () => void
}

type EcosystemLinkProps = {
  ecosystemLinks: AppLink[]
}

type SocialLinkProps = {
  socialLinks: AppLink[]
}

type MobileNavProps = NavLinkProps &
  EcosystemLinkProps &
  SocialLinkProps & { LogoType: React.FC<any> }

function NavLinks({ appLinks, onClick }: NavLinkProps) {
  const { linkColorFor } = useNav()

  return (
    <VStack align="start" w="full">
      {appLinks.map(link => (
        <Link
          as={NextLink}
          color={linkColorFor(link.href)}
          fontSize="xl"
          href={link.href}
          key={link.href}
          onClick={onClick}
          prefetch
          variant="nav"
        >
          {link.label}
        </Link>
      ))}
      <VeBalLink fontSize="xl" />
    </VStack>
  )
}

function EcosystemLinks({ ecosystemLinks }: EcosystemLinkProps) {
  return (
    <VStack align="start" w="full">
      <Text color="grayText" mb="sm" size="xs">
        Ecosystem
      </Text>
      {ecosystemLinks.map(link => (
        <Link
          alignItems="center"
          display="flex"
          gap="xs"
          href={link.href}
          isExternal
          key={link.href}
          variant="nav"
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

function SocialLinks({ socialLinks }: SocialLinkProps) {
  return (
    <HStack justify="space-between" w="full">
      {socialLinks.map(({ href, icon }) => (
        <Button as={Link} href={href} isExternal key={href} variant="tertiary">
          {icon}
        </Button>
      ))}
    </HStack>
  )
}

export function MobileNav({ appLinks, ecosystemLinks, socialLinks, LogoType }: MobileNavProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef(null)
  const router = useRouter()

  function homeRedirect() {
    onClose()
    router.push('/')
  }

  return (
    <>
      <Button onClick={onOpen} ref={btnRef} variant="tertiary">
        <Menu size={18} />
      </Button>
      <Drawer finalFocusRef={btnRef} isOpen={isOpen} onClose={onClose} placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <LogoType onClick={homeRedirect} width="106px" />
          </DrawerHeader>
          <DrawerBody>
            <NavLinks appLinks={appLinks} onClick={onClose} />
            <Divider my={4} />
            <EcosystemLinks ecosystemLinks={ecosystemLinks} />
          </DrawerBody>
          <DrawerFooter>
            <SocialLinks socialLinks={socialLinks} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
