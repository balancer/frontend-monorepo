'use client'

import { Badge, Box, Container, HStack, Heading, Link } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'

const NAVBAR_HEIGHT = '72px'
const SCROLL_OFFSET = 96

type NavLink = {
  label: string
  href: string
  /** Section anchor on `/` — null for stand-alone routes. */
  section: string | null
  /** Pathnames where the link should render as active. */
  matchPaths?: string[]
}

// Hrefs are root-relative (`/#section`) rather than bare anchors so they
// also work from non-home routes like `/pool/[chain]/[id]`. Bare `#anchor`
// only resolves against the current page's DOM, which on the pool detail
// page has none of these section ids.
const NAV_LINKS: NavLink[] = [
  { label: 'Overview', href: '/#overview', section: 'overview' },
  { label: 'Liquidity', href: '/#liquidity', section: 'liquidity' },
  { label: 'Pools', href: '/#pools', section: 'pools' },
  { label: 'Governance', href: '/governance', section: null, matchPaths: ['/governance'] },
  { label: 'Portfolio', href: '/portfolio', section: null, matchPaths: ['/portfolio'] },
]

/**
 * Scroll a section into view, accounting for the fixed navbar. Retries with
 * `requestAnimationFrame` because sections live inside `FadeInOnView` and may
 * be still measuring on the very first frame — without the retry, an initial
 * `/#governance` load lands at the wrong scroll offset (or doesn't move at
 * all if the IntersectionObserver fires later and shifts layout).
 */
function scrollToSection(id: string, attempt = 0): void {
  const el = document.getElementById(id)
  if (!el) {
    if (attempt < 30) {
      requestAnimationFrame(() => scrollToSection(id, attempt + 1))
    }
    return
  }
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
  window.scrollTo({ top, behavior: attempt === 0 ? 'smooth' : 'auto' })
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('overview')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    document.documentElement.style.setProperty('--navbar-height', NAVBAR_HEIGHT)
  }, [])

  // Honour the URL hash on first load and on every native back/forward.
  // Next.js' built-in hash-scroll often fires before the client-rendered
  // sections exist, so we re-run the scroll after hydration ourselves.
  useEffect(() => {
    if (pathname !== '/') return
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    scrollToSection(hash)
  }, [pathname])

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) scrollToSection(hash)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8)

      // Only run active-section detection on pages that actually expose
      // the section anchors. The pool detail route has none of them, so
      // bail out and clear the highlight rather than pretending we're on
      // "Overview".
      const sectionLinks = NAV_LINKS.filter(
        (l): l is NavLink & { section: string } => l.section !== null
      )
      const hasAnySection = sectionLinks.some(link => document.getElementById(link.section))
      if (!hasAnySection) {
        setActiveSection('')
        return
      }

      let current = sectionLinks[0]?.section ?? ''
      for (const link of sectionLinks) {
        const el = document.getElementById(link.section)
        if (!el) continue
        if (el.getBoundingClientRect().top - SCROLL_OFFSET <= 0) current = link.section
      }
      setActiveSection(current)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hash navigation via Next.js' `<Link>` has been unreliable: clicking
  // `/#liquidity` while the URL already has a fragment (e.g. `/#governance`)
  // sometimes concatenates the two into `/#governance#liquidity` instead of
  // replacing. We bypass it: when we're already on `/`, replace the hash via
  // `history.pushState` and scroll ourselves; otherwise SPA-navigate.
  const handleNavClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, section: string) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
      event.preventDefault()
      if (pathname === '/') {
        const nextUrl = `/#${section}`
        if (window.location.hash !== `#${section}`) {
          window.history.pushState(null, '', nextUrl)
        }
        scrollToSection(section)
        setActiveSection(section)
      } else {
        router.push(`/#${section}`)
      }
    },
    [pathname, router]
  )

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
              <HStack spacing="sm">
                <Link
                  _hover={{ textDecoration: 'none' }}
                  aria-label="Balancer Analytics home"
                  as={NextLink}
                  href="/"
                >
                  <HStack spacing="sm">
                    <Image
                      alt="Balancer"
                      height={28}
                      priority
                      src="/images/protocols/balancer.svg"
                      width={28}
                    />
                    <Heading
                      display={{ base: 'none', sm: 'block' }}
                      fontSize="md"
                      fontWeight="bold"
                      letterSpacing="-0.2px"
                      size="h6"
                    >
                      Balancer Analytics
                    </Heading>
                  </HStack>
                </Link>

                <Badge
                  aria-label="Alpha release"
                  colorScheme="orange"
                  fontSize="0.65rem"
                  letterSpacing="0.5px"
                  size="sm"
                  textTransform="uppercase"
                  variant="subtle"
                >
                  Alpha
                </Badge>
              </HStack>

              <HStack display={{ base: 'none', md: 'flex' }} spacing="lg">
                {NAV_LINKS.map(link => {
                  const isActiveBySection = link.section !== null && activeSection === link.section
                  const isActiveByPath = link.matchPaths?.some(p => pathname.startsWith(p)) ?? false
                  const isActive = isActiveBySection || isActiveByPath
                  return (
                    <Link
                      _hover={{ color: 'font.maxContrast', textDecoration: 'none' }}
                      as={NextLink}
                      color={isActive ? 'font.maxContrast' : 'font.secondary'}
                      fontSize="sm"
                      fontWeight="medium"
                      href={link.href}
                      key={link.href}
                      onClick={
                        link.section ? e => handleNavClick(e, link.section as string) : undefined
                      }
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
