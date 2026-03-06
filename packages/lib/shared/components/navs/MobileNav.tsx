import { useDisclosure } from '@chakra-ui/react'
import {
  Box,
  Button,
  Drawer,
  HStack,
  Link,
  Text,
  VStack,
  Separator,
  Portal,
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
  SocialLinkProps & {
    LogoType: React.FC<any>
    buildSection?: React.ReactNode | ((onClose: () => void) => React.ReactNode)
  }

function NavLinks({ appLinks, onClick, customLinks }: NavLinkProps) {
  const { linkColorFor } = useNav()

  return (
    <VStack align="start" w="full">
      {appLinks.map(link => (
        <Link
          alignItems="center"
          asChild
          color={linkColorFor(link.href || '')}
          display="flex"
          fontSize="xl"
          gap="xs"
          variant="nav"
        >
          <NextLink
            href={link.href ?? ''}
            key={link.href}
            onClick={onClick}
            prefetch
            rel="noopener noreferrer"
            target="_blank"
          >
            {link.label}
            {link.isExternal && (
              <Box color="grayText">
                <ArrowUpRight size={14} />
              </Box>
            )}
          </NextLink>
        </Link>
      ))}
      {customLinks}
    </VStack>
  )
}

function EcosystemLinks({ ecosystemLinks }: EcosystemLinkProps) {
  return (
    <VStack align="start" w="full">
      <Text color="grayText" fontSize="xs" mb="sm">
        Ecosystem
      </Text>
      {ecosystemLinks.map(link => (
        <Link
          alignItems="center"
          display="flex"
          gap="xs"
          href={link.href}
          key={link.href}
          rel="noopener noreferrer"
          target="_blank"
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
        <Button asChild isExternal variant="tertiary">
          <Link href={href} key={href}>
            <SocialIcon iconType={iconType} />
          </Link>
        </Button>
      ))}
    </HStack>
  )
}

export function MobileNav({
  appLinks,
  buildSection,
  ecosystemLinks,
  socialLinks,
  LogoType,
  customLinks,
}: MobileNavProps) {
  const { open, onOpen, onClose } = useDisclosure()
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
      <Drawer.Root
        finalFocusEl={() => btnRef.current}
        onOpenChange={(e: { open: boolean }) => {
          if (!e.open) {
            onClose()
          }
        }}
        open={open}
        placement="end"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <LogoType onClick={homeRedirect} width="106px" />
              </Drawer.Header>
              <Drawer.Body>
                <NavLinks appLinks={appLinks} customLinks={customLinks} onClick={onClose} />
                {typeof buildSection === 'function' ? buildSection(onClose) : buildSection}
                <Separator my={4} />
                <EcosystemLinks ecosystemLinks={ecosystemLinks} />
              </Drawer.Body>
              <Drawer.Footer>
                <SocialLinks socialLinks={socialLinks} />
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  )
}
