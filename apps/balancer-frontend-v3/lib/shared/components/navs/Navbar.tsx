'use client'

import NextLink from 'next/link'
import DarkModeToggle from '../btns/DarkModeToggle'
import { Box, HStack, BoxProps, Link, Button } from '@chakra-ui/react'
import { ConnectWallet } from '@/lib/modules/web3/ConnectWallet'
import { BalancerLogo } from '../imgs/BalancerLogo'
import { BalancerLogoType } from '../imgs/BalancerLogoType'
import { UserSettings } from '@/lib/modules/user/settings/UserSettings'
import RecentTransactions from '../other/RecentTransactions'
import { isDev, isStaging } from '@/lib/config/app.config'
import { staggeredFadeIn, fadeIn } from '@/lib/shared/utils/animations'
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from 'framer-motion'
import { VeBalLink } from '@/lib/modules/vebal/VebalRedirectModal'
import { MobileNav } from './MobileNav'
import { useNav } from './useNav'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'

type Props = {
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
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

function NavLinks({ ...props }: BoxProps) {
  const { appLinks, linkColorFor } = useNav()

  return (
    <HStack spacing="lg" fontWeight="medium" {...props}>
      {appLinks.map(link => (
        <Box key={link.href} as={motion.div} variants={fadeIn}>
          <Link
            as={NextLink}
            href={link.href}
            prefetch={true}
            variant="nav"
            color={linkColorFor(link.href)}
          >
            {link.label}
          </Link>
        </Box>
      ))}
      <Box as={motion.div} variants={fadeIn}>
        <VeBalLink />
      </Box>
      {(isDev || isStaging) && (
        <Box as={motion.div} variants={fadeIn}>
          <Link
            as={NextLink}
            variant="nav"
            href="/debug"
            prefetch={true}
            color={linkColorFor('/debug')}
          >
            Debug
          </Link>
        </Box>
      )}
    </HStack>
  )
}

function NavLogo() {
  return (
    <Box as={motion.div} variants={fadeIn}>
      <Link as={NextLink} variant="nav" href="/" prefetch={true}>
        <Box>
          <Box display={{ base: 'block', md: 'none' }}>
            <BalancerLogo width="26px" />
          </Box>
          <Box display={{ base: 'none', md: 'block' }}>
            <BalancerLogoType width="106px" />
          </Box>
        </Box>
      </Link>
    </Box>
  )
}

function NavActions() {
  const pathname = usePathname()
  const { isConnected } = useUserAccount()

  const actions = useMemo(() => {
    if (pathname === '/') {
      return [
        {
          el: <DarkModeToggle />,
          display: { base: 'none', lg: 'block' },
        },
        {
          el: (
            <Button size="md" px={7} as={NextLink} href="/pools" prefetch={true} variant="primary">
              Launch app
            </Button>
          ),
          display: { base: 'block', lg: 'block' },
        },
        {
          el: <MobileNav />,
          display: { base: 'block', lg: 'none' },
        },
      ]
    }

    const defaultActions = [
      {
        el: <UserSettings />,
        display: { base: 'none', lg: 'block' },
      },
      {
        el: <DarkModeToggle />,
        display: { base: 'none', lg: 'block' },
      },
      {
        el: <ConnectWallet />,
        display: { base: 'block', lg: 'block' },
      },
      {
        el: <MobileNav />,
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
  }, [pathname, isConnected])

  return (
    <>
      {actions.map(({ el, display }, i) => (
        <Box key={i} as={motion.div} variants={fadeIn} display={display}>
          {el}
        </Box>
      ))}
    </>
  )
}

export function Navbar({ leftSlot, rightSlot, disableBlur, ...rest }: Props & BoxProps) {
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
      as={motion.div}
      w="full"
      pos="fixed"
      zIndex={100}
      top="0"
      transition="all 0.3s ease-in-out"
      style={{
        backdropFilter: disableBlur ? 'none' : backdropFilter,
        top: disableBlur ? 0 : top,
        opacity: disableBlur ? 1 : opacity,
      }}
      onScroll={e => console.log('Navbar scroll:', e)}
      boxShadow={showShadow ? 'lg' : 'none'}
      borderColor="border.base"
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
      {...rest}
    >
      <HStack padding={{ base: 'sm', md: 'md' }} justify="space-between" as="nav">
        <HStack
          spacing="lg"
          onClick={e => e.stopPropagation()}
          as={motion.div}
          variants={staggeredFadeIn}
          initial="hidden"
          animate="show"
        >
          {leftSlot || (
            <>
              <NavLogo />
              <NavLinks display={{ base: 'none', lg: 'flex' }} />
            </>
          )}
        </HStack>
        <HStack
          order={{ md: '2' }}
          onClick={e => e.stopPropagation()}
          as={motion.div}
          variants={staggeredFadeIn}
          initial="hidden"
          animate="show"
        >
          {rightSlot || <NavActions />}
        </HStack>
      </HStack>
    </Box>
  )
}
