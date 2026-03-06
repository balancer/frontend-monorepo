'use client'

import { Button, HStack, Link, Popover, VStack } from '@chakra-ui/react'
import { SwapIcon } from '@repo/lib/shared/components/icons/SwapIcon'
import { staggeredFadeInUp } from '@repo/lib/shared/utils/animations'
import { AnimatePresence, motion } from 'framer-motion'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { MoreVertical } from 'react-feather'
import { isCowAmmPool, isMaBeetsPool } from '../../pool.helpers'
import { usePool } from '../../PoolProvider'
import { buildCowSwapUrlFromPool } from '@repo/lib/modules/cow/cow.utils'
import { CowIcon } from '@repo/lib/shared/components/icons/logos/CowIcon'

export function PoolAdvancedOptions() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const pathname = usePathname()
  const { pool } = usePool()
  const isCowPool = isCowAmmPool(pool.type)
  const isPoolSwapDisabled = !isMaBeetsPool(pool.id) && isCowPool

  const disabledLinkProps = isPoolSwapDisabled
    ? {
        color: 'font.button.disabled',
        cursor: 'not-allowed',
        opacity: 0.3,
        pointerEvents: 'none' as const,
      }
    : {}

  return (
    <Popover.Root
      onOpenChange={(e: { open: boolean }) => {
        if (e.open) {
          setIsPopoverOpen(true)
        } else {
          setIsPopoverOpen(false)
        }
      }}
      open={isPopoverOpen}
      positioning={{
        placement: 'bottom-end',
      }}
    >
      <Popover.Trigger asChild>
        <Button color="grayText" size="md" variant="tertiary">
          <MoreVertical size={16} />
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content shadow="2xl" width="max-content" zIndex="popover">
          <Popover.Arrow bg="background.level3" />
          <Popover.Body px="md" py="lg">
            <AnimatePresence>
              {isPopoverOpen ? (
                <VStack
                  align="start"
                  animate="show"
                  asChild
                  exit="exit"
                  gap="xxs"
                  initial="hidden"
                  variants={staggeredFadeInUp}
                >
                  <motion.div>
                    {isCowPool ? (
                      <HStack>
                        <CowIcon size={20} />
                        <Link
                          href={buildCowSwapUrlFromPool(pool)}
                          rel="noopener noreferrer"
                          target="_blank"
                          variant="nav"
                        >
                          Swap pool tokens on CoW Swap
                        </Link>
                      </HStack>
                    ) : (
                      <HStack>
                        <SwapIcon size={20} />
                        <Link variant="nav" {...disabledLinkProps} asChild>
                          <NextLink href={`${pathname}/swap`} prefetch>
                            Swap through pool
                          </NextLink>
                        </Link>
                      </HStack>
                    )}
                  </motion.div>
                </VStack>
              ) : null}
            </AnimatePresence>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
