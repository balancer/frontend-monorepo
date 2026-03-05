'use client'

import { Box, BoxProps, Button, HStack, Link } from '@chakra-ui/react'
import { isDev, isStaging, shouldUseAnvilFork } from '@repo/lib/config/app.config'
import { UserSettings } from '@repo/lib/modules/user/settings/UserSettings'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { fadeIn, staggeredFadeIn } from '@repo/lib/shared/utils/animations'
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from 'framer-motion'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import DarkModeToggle from '../btns/DarkModeToggle'
import RecentTransactions from '../other/RecentTransactions'
import { AppLink, useNav } from './useNav'
import { clamp } from 'lodash'
import { useThemeSettings } from '../../services/chakra/useThemeSettings'
import { ArrowUpRight } from 'react-feather'
import { DevToolsDrawerButton } from '@repo/lib/modules/dev-tools/DevToolsDrawer'
import { isBalancer } from '@repo/lib/config/getProjectConfig'
import { UserFeedback } from '@repo/lib/modules/user/UserFeedback'
import { ApiOutageAlert } from '../alerts/ApiOutageAlert'
import { useApiHealth } from '../../hooks/useApiHealth'
import { AnalyticsEvent, trackEvent } from '../../services/fathom/Fathom'

type Props = {
  mobileNav?: ReactNode
  navLogo?: ReactNode
  appLinks?: AppLink[]
  leftSlot?: ReactNode
  rightSlot?: ReactNode
  disableBlur?: boolean
  customLinks?: ReactNode
  allowCreateWallet?: boolean
}

function useBoundedScroll(threshold: number) {
  const { scrollY } = useScroll()
  const scrollYBounded = useMotionValue(0)
  const scrollYBoundedProgress = useTransform(scrollYBounded, [0, threshold], [0, 1])

  useEffect(() => {
    return scrollY.on('change', current => {
      const previous = scrollY.getPrevious() ?? current
      const diff = current - previous
      const newScrollYBounded = scrollYBounded.get() + diff

      scrollYBounded.set(clamp(newScrollYBounded, 0, threshold))
    })
  }, [threshold, scrollY, scrollYBounded])

  return { scrollYBounded, scrollYBoundedProgress }
}

function NavLinks({
  appLinks,
  customLinks,
  ...props
}: BoxProps & {
  appLinks: AppLink[]
  customLinks?: ReactNode
}) {
  const { linkColorFor } = useNav()

  const handleLinkClick = (analyticsEvent?: string) => {
    if (analyticsEvent && AnalyticsEvent[analyticsEvent as keyof typeof AnalyticsEvent]) {
      trackEvent(AnalyticsEvent[analyticsEvent as keyof typeof AnalyticsEvent])
    }
  }

  return (
    <HStack fontWeight="medium" gap="lg" {...props}>
      {appLinks.map(link => {
        if (!link.href) return null
        return (
          <Box asChild variants={fadeIn}>
            <motion.div key={link.href}>
              <Link asChild color={linkColorFor(link.href || '')} variant="nav">
                <NextLink
                  href={link.href}
                  onClick={() => handleLinkClick(link.analyticsEvent)}
                  prefetch
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <HStack gap="xxs">
                    <Box as="span">{link.label}</Box>
                    {link.isExternal && (
                      <Box as="span" color="grayText" position="relative" top="-4px">
                        <ArrowUpRight size={12} />
                      </Box>
                    )}
                  </HStack>
                </NextLink>
              </Link>
            </motion.div>
          </Box>
        )
      })}
      {customLinks}
      {(isDev || isStaging) && (
        <>
          <Box asChild variants={fadeIn}>
            <motion.div>
              <Link asChild color={linkColorFor('/lbp/create')} variant="nav">
                <NextLink href="/lbp/create" prefetch>
                  LBP
                </NextLink>
              </Link>
            </motion.div>
          </Box>
          <Box asChild variants={fadeIn}>
            <motion.div>
              <Link asChild color={linkColorFor('/create')} variant="nav">
                <NextLink href="/create" prefetch>
                  Create
                </NextLink>
              </Link>
            </motion.div>
          </Box>
          <Box asChild variants={fadeIn}>
            <motion.div>
              <Link asChild color={linkColorFor('/debug/pools')} variant="nav">
                <NextLink href="/debug/pools" prefetch>
                  Test-Pools
                </NextLink>
              </Link>
            </motion.div>
          </Box>
          <Box asChild variants={fadeIn}>
            <motion.div>
              <Link asChild color={linkColorFor('/debug')} variant="nav">
                <NextLink href="/debug" prefetch>
                  Debug
                </NextLink>
              </Link>
            </motion.div>
          </Box>
        </>
      )}
    </HStack>
  )
}

export function NavActions({
  mobileNav,
  allowCreateWallet,
}: {
  mobileNav: ReactNode
  allowCreateWallet?: boolean
}) {
  const pathname = usePathname()
  const { isConnected } = useUserAccount()
  const { hideDarkModeToggle } = useThemeSettings()

  const actions = useMemo(() => {
    if (pathname === '/') {
      return [
        {
          el: hideDarkModeToggle ? null : <DarkModeToggle />,
          display: { base: 'none', lg: 'block' },
        },
        {
          el: (
            <Button asChild px={7} size="md" variant="primary">
              <NextLink href="/pools" prefetch>
                Launch app
              </NextLink>
            </Button>
          ),
          display: { base: 'block', lg: 'block' },
        },
        {
          el: mobileNav,
          display: { base: 'block', lg: 'none' },
        },
      ]
    }

    const defaultActions = [
      ...(shouldUseAnvilFork
        ? [
            {
              el: <DevToolsDrawerButton />,
              display: { base: 'block', lg: 'block' },
            },
          ]
        : []),
      {
        el: <UserSettings />,
        display: { base: 'none', lg: 'block' },
      },
      ...(isBalancer
        ? [
            {
              el: <UserFeedback />,
              display: { base: 'none', lg: 'block' },
            },
          ]
        : []),
      {
        el: hideDarkModeToggle ? null : <DarkModeToggle />,
        display: { base: 'none', lg: 'block' },
      },
      {
        el: (
          <ConnectWallet
            connectLabel={allowCreateWallet ? 'Connect' : 'Connect wallet'}
            showCreateWalletButton={allowCreateWallet}
          />
        ),
        display: { base: 'block', lg: 'block' },
      },
      {
        el: mobileNav,
        display: { base: 'block', lg: 'none' },
      },
    ]

    if (isConnected) {
      return [
        {
          el: <RecentTransactions />,
          display: { base: 'none', lg: 'block' },
        },
        ...defaultActions,
      ]
    }

    return defaultActions
  }, [pathname, isConnected, hideDarkModeToggle, mobileNav, allowCreateWallet])

  return (
    <>
      {actions.map(
        ({ el, display }, i) =>
          el && (
            <Box asChild display={display} key={i} variants={fadeIn}>
              <motion.div>{el}</motion.div>
            </Box>
          )
      )}
    </>
  )
}

export function NavBar({
  leftSlot,
  rightSlot,
  disableBlur,
  appLinks,
  navLogo,
  mobileNav,
  customLinks,
  allowCreateWallet,
  ...rest
}: Props & BoxProps) {
  const { apiOK } = useApiHealth()
  const [showShadow, setShowShadow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 72) setShowShadow(true)
      else setShowShadow(false)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { scrollYBoundedProgress } = useBoundedScroll(72)
  const scrollYBoundedProgressDelayed = useTransform(
    scrollYBoundedProgress,
    [0, 0.75, 1],
    [0, 0, 1]
  )

  const blurEffect = useTransform(scrollYBoundedProgressDelayed, [0, 1], [10, 0])
  const backdropFilter = useMotionTemplate`blur(${blurEffect}px)`
  const top = useTransform(scrollYBoundedProgressDelayed, [0, 1], [0, -72])
  const opacity = useTransform(scrollYBoundedProgressDelayed, [0, 1], [1, 0])

  // Determine navbar height based on alerts
  const hasAlerts = !apiOK
  const navbarHeight = hasAlerts ? '120px' : '72px'

  // Set CSS variable on document root
  useEffect(() => {
    document.documentElement.style.setProperty('--navbar-height', navbarHeight)
  }, [navbarHeight])

  return (
    <Box
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: showShadow ? 'background.level1' : 'none',
        opacity: 0.5,
        zIndex: -1,
      }}
      borderColor="border.base"
      boxShadow={showShadow ? 'lg' : 'none'}
      pos="fixed"
      style={{
        backdropFilter: disableBlur ? 'none' : backdropFilter,
        top: disableBlur ? 0 : top,
        opacity: disableBlur ? 1 : opacity,
      }}
      top="0"
      transition="all 0.3s ease-in-out"
      w="full"
      zIndex={100}
      {...rest}
      asChild
    >
      <motion.div onScroll={e => console.log('Navbar scroll:', e)}>
        {!apiOK && <ApiOutageAlert />}
        <HStack as="nav" justify="space-between" padding={{ base: 'sm', md: 'md' }}>
          <HStack
            animate="show"
            asChild
            gap="xl"
            initial={process.env.NODE_ENV === 'development' ? false : 'hidden'}
            variants={staggeredFadeIn}
          >
            <motion.div onClick={e => e.stopPropagation()}>
              {leftSlot || (
                <>
                  {navLogo}
                  {appLinks && (
                    <NavLinks
                      appLinks={appLinks}
                      customLinks={customLinks}
                      display={{ base: 'none', lg: 'flex' }}
                    />
                  )}
                </>
              )}
            </motion.div>
          </HStack>
          <HStack
            animate="show"
            asChild
            initial={process.env.NODE_ENV === 'development' ? false : 'hidden'}
            order={{ md: '2' }}
            variants={staggeredFadeIn}
          >
            <motion.div onClick={e => e.stopPropagation()}>
              {rightSlot || (
                <NavActions allowCreateWallet={allowCreateWallet} mobileNav={mobileNav} />
              )}
            </motion.div>
          </HStack>
        </HStack>
      </motion.div>
    </Box>
  )
}
