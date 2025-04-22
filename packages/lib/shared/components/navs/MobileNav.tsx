import { useDisclosure } from '@chakra-ui/hooks'
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { ArrowUpRight, Menu } from 'react-feather'
import { AppLink, useNav } from './useNav'
import { SocialIcon } from './SocialIcon'

type NavLinkProps = {
  appLinks: AppLink[]
  customLinks?: React.ReactNode
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

function NavLinks({ appLinks, onClick, customLinks }: NavLinkProps) {
  const { linkColorFor } = useNav()

  return (
    <VStack align="start" w="full">
      {appLinks.map(link => (
        <Link
          alignItems="center"
          as={NextLink}
          color={linkColorFor(link.href)}
          display="flex"
          fontSize="xl"
          gap="xs"
          href={link.href}
          isExternal
          key={link.href}
          onClick={onClick}
          prefetch
          variant="nav"
        >
          {link.label}
          {link.isExternal && (
            <Box color="grayText">
              <ArrowUpRight size={14} />
            </Box>
          )}
        </Link>
      ))}
      {customLinks}
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
      {socialLinks.map(({ href, iconType }) => (
        <Button as={Link} href={href} isExternal key={href} variant="tertiary">
          <SocialIcon iconType={iconType} />
        </Button>
      ))}
    </HStack>
  )
}

export function MobileNav({
  appLinks,
  ecosystemLinks,
  socialLinks,
  LogoType,
  customLinks,
}: MobileNavProps) {
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
            <NavLinks appLinks={appLinks} customLinks={customLinks} onClick={onClose} />
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
