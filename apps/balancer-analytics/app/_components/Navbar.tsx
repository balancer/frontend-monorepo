'use client'

import { Box, Container, HStack, Heading, Link } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

const NAVBAR_HEIGHT = '72px'

const NAV_LINKS: { label: string; href: string; section: string }[] = [
  { label: 'Overview', href: '#overview', section: 'overview' },
  { label: 'Liquidity', href: '#liquidity', section: 'liquidity' },
  { label: 'Pools', href: '#pools', section: 'pools' },
  { label: 'Governance', href: '#governance', section: 'governance' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('overview')

  useEffect(() => {
    document.documentElement.style.setProperty('--navbar-height', NAVBAR_HEIGHT)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8)

      const offset = 96
      let current = NAV_LINKS[0].section
      for (const link of NAV_LINKS) {
        const el = document.getElementById(link.section)
        if (!el) continue
        if (el.getBoundingClientRect().top - offset <= 0) current = link.section
      }
      setActiveSection(current)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: -8 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Box
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          bg: scrolled ? 'background.level1' : 'transparent',
          opacity: scrolled ? 0.7 : 0,
          transition: 'opacity 0.25s ease',
          zIndex: -1,
        }}
        as="nav"
        backdropFilter={scrolled ? 'blur(10px)' : 'none'}
        borderBottom="1px solid"
        borderColor={scrolled ? 'border.base' : 'transparent'}
        boxShadow={scrolled ? 'lg' : 'none'}
        h={NAVBAR_HEIGHT}
        transitionDuration="0.25s"
        transitionProperty="background, box-shadow, border-color, backdrop-filter"
        w="full"
      >
        <Container h="full" maxW="maxContent" px={['ms', 'md']}>
          <HStack align="center" h="full" justify="space-between" w="full">
            <HStack spacing="xl">
              <Link
                _hover={{ textDecoration: 'none' }}
                aria-label="DeFilytica homepage"
                as={NextLink}
                href="https://defilytica.com"
                isExternal
                rel="noopener noreferrer"
              >
                <HStack spacing="sm">
                  <Image
                    alt="DeFilytica"
                    height={28}
                    priority
                    src="/images/defilytica.png"
                    width={28}
                  />
                  <Heading
                    display={{ base: 'none', sm: 'block' }}
                    fontSize="md"
                    fontWeight="bold"
                    letterSpacing="-0.2px"
                    size="h6"
                  >
                    DeFilytica
                  </Heading>
                </HStack>
              </Link>

              <HStack display={{ base: 'none', md: 'flex' }} spacing="lg">
                {NAV_LINKS.map(link => {
                  const isActive = activeSection === link.section
                  return (
                    <Link
                      _hover={{ color: 'font.maxContrast', textDecoration: 'none' }}
                      as={NextLink}
                      color={isActive ? 'font.maxContrast' : 'font.secondary'}
                      fontSize="sm"
                      fontWeight="medium"
                      href={link.href}
                      key={link.href}
                      transition="color 0.15s"
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </HStack>
            </HStack>

          </HStack>
        </Container>
      </Box>
    </motion.div>
  )
}
