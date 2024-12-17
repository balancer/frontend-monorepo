'use client'

import NextLink from 'next/link'
import DarkModeToggle from '../btns/DarkModeToggle'
import { Box, HStack, BoxProps, Link, Button } from '@chakra-ui/react'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { UserSettings } from '@repo/lib/modules/user/settings/UserSettings'
import RecentTransactions from '../other/RecentTransactions'
import { isDev, isStaging } from '@repo/lib/config/app.config'
import { staggeredFadeIn, fadeIn } from '@repo/lib/shared/utils/animations'
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from 'framer-motion'
import { VeBalLink } from '@repo/lib/modules/vebal/VebalRedirectModal'
import { AppLink, useNav } from './useNav'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { isBalancerProject } from '@repo/lib/config/getProjectConfig'

type Props = {
  mobileNav?: ReactNode
  navLogo?: ReactNode
  appLinks?: AppLink[]
  leftSlot?: ReactNode
  rightSlot?: ReactNode
  disableBlur?: boolean
}

const clamp = (number: number, min: number, max: number) => Math.min(Math.max(number, min), max)

function useBoundedScroll(threshold: number) {
  const { scrollY } = useScroll()
  const scrollYBounded = useMotionValue(0)
  const scrollYBoundedProgress = useTransform(scrollYBounded, [0, threshold], [0, 1])

  useEffect(() => {
    return scrollY.on('change', current => {
      const previous = scrollY.getPrevious()
      const diff = current - previous
      const newScrollYBounded = scrollYBounded.get() + diff

      scrollYBounded.set(clamp(newScrollYBounded, 0, threshold))
    })
  }, [threshold, scrollY, scrollYBounded])

  return { scrollYBounded, scrollYBoundedProgress }
}

function NavLinks({ appLinks, ...props }: BoxProps & { appLinks: AppLink[] }) {
  const { linkColorFor } = useNav()

  return (
    <HStack fontWeight="medium" spacing="lg" {...props}>
      {appLinks.map(link => (
        <Box as={motion.div} key={link.href} variants={fadeIn}>
          <Link
            as={NextLink}
            color={linkColorFor(link.href)}
            href={link.href}
            isExternal={link.isExternal}
            prefetch
            variant="nav"
          >
            {link.label}
          </Link>
        </Box>
      ))}
      {/* Vebal is only supported in Balancer project */}
      {isBalancerProject && (
        <Box as={motion.div} variants={fadeIn}>
          <VeBalLink />
        </Box>
      )}
      {(isDev || isStaging) && (
        <Box as={motion.div} variants={fadeIn}>
          {/* <Link as={NextLink} color={linkColorFor('/debug')} href="/debug" prefetch variant="nav">
            Debug
          </Link> */}
          <Link
            as={NextLink}
            color={linkColorFor('/testooors')}
            href="/testooors"
            prefetch
            variant="nav"
          >
            Test
          </Link>
        </Box>
      )}
    </HStack>
  )
}

function NavActions({ mobileNav }: { mobileNav: ReactNode }) {
  const pathname = usePathname()
  const { isConnected } = useUserAccount()

  const actions = useMemo(() => {
    if (pathname === '/') {
      return [
        ...(isBalancerProject
          ? [
              {
                el: <DarkModeToggle />,
                display: { base: 'none', lg: 'block' },
              },
            ]
          : []),
        {
          el: (
            <Button as={NextLink} href="/pools" prefetch px={7} size="md" variant="primary">
              Launch app
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
      {
        el: <UserSettings />,
        display: { base: 'none', lg: 'block' },
      },
      ...(isBalancerProject
        ? [
            {
              el: <DarkModeToggle />,
              display: { base: 'none', lg: 'block' },
            },
          ]
        : []),
      {
        el: <ConnectWallet />,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isConnected])

  return (
    <>
      {actions.map(({ el, display }, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Box as={motion.div} display={display} key={i} variants={fadeIn}>
          {el}
        </Box>
      ))}
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
  ...rest
}: Props & BoxProps) {
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
      as={motion.div}
      borderColor="border.base"
      boxShadow={showShadow ? 'lg' : 'none'}
      onScroll={e => console.log('Navbar scroll:', e)}
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
    >
      <HStack as="nav" justify="space-between" padding={{ base: 'sm', md: 'md' }}>
        <HStack
          animate="show"
          as={motion.div}
          initial="hidden"
          onClick={e => e.stopPropagation()}
          spacing="xl"
          variants={staggeredFadeIn}
        >
          {leftSlot || (
            <>
              {navLogo}
              {appLinks && <NavLinks appLinks={appLinks} display={{ base: 'none', lg: 'flex' }} />}
            </>
          )}
        </HStack>
        <HStack
          animate="show"
          as={motion.div}
          initial="hidden"
          onClick={e => e.stopPropagation()}
          order={{ md: '2' }}
          variants={staggeredFadeIn}
        >
          {rightSlot || <NavActions mobileNav={mobileNav} />}
        </HStack>
      </HStack>
    </Box>
  )
}
