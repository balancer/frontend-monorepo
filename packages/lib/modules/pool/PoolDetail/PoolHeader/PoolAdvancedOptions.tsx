'use client'

import {
  Box,
  Button,
  HStack,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  VStack,
} from '@chakra-ui/react'
import { SwapIcon } from '@repo/lib/shared/components/icons/SwapIcon'
import { staggeredFadeInUp } from '@repo/lib/shared/utils/animations'
import { AnimatePresence, motion } from 'framer-motion'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { MoreVertical } from 'react-feather'
import { isCowAmmPool, isMaBeetsPool, shouldBlockAddLiquidity } from '../../pool.helpers'
import { usePool } from '../../PoolProvider'
import { buildCowSwapUrlFromPool } from '@repo/lib/modules/cow/cow.utils'
import { CowIcon } from '@repo/lib/shared/components/icons/logos/CowIcon'
import { usePoolMetadata } from '../../metadata/usePoolMetadata'

export function PoolAdvancedOptions() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const pathname = usePathname()
  const { pool } = usePool()
  const poolMetadata = usePoolMetadata(pool)
  const isCowPool = isCowAmmPool(pool.type)
  const isPoolSwapDisabled =
    !isMaBeetsPool(pool.id) && (shouldBlockAddLiquidity(pool, poolMetadata) || isCowPool)

  const disabledLinkProps = isPoolSwapDisabled
    ? {
        color: 'font.button.disabled',
        cursor: 'not-allowed',
        opacity: 0.3,
        pointerEvents: 'none' as const,
      }
    : {}

  return (
    <Popover
      isOpen={isPopoverOpen}
      onClose={() => setIsPopoverOpen(false)}
      onOpen={() => setIsPopoverOpen(true)}
      placement="bottom-end"
    >
      <PopoverTrigger>
        <Button color="grayText" size="lg" variant="tertiary">
          <MoreVertical size={16} />
        </Button>
      </PopoverTrigger>
      <Box shadow="2xl" width="max" zIndex="popover">
        <PopoverContent>
          <PopoverArrow bg="background.level3" />
          <PopoverBody px="md" py="lg">
            <AnimatePresence>
              {isPopoverOpen ? (
                <VStack
                  align="start"
                  animate="show"
                  as={motion.div}
                  exit="exit"
                  initial="hidden"
                  spacing="xxs"
                  variants={staggeredFadeInUp}
                >
                  {isCowPool ? (
                    <HStack>
                      <CowIcon size={20} />
                      <Link
                        as={NextLink}
                        href={buildCowSwapUrlFromPool(pool)}
                        target="_blank"
                        variant="nav"
                      >
                        Swap pool tokens on CoW Swap
                      </Link>
                    </HStack>
                  ) : (
                    <HStack>
                      <SwapIcon size={20} />
                      <Link
                        as={NextLink}
                        href={`${pathname}/swap`}
                        prefetch
                        variant="nav"
                        {...disabledLinkProps}
                      >
                        Swap through pool
                      </Link>
                    </HStack>
                  )}
                </VStack>
              ) : null}
            </AnimatePresence>
          </PopoverBody>
        </PopoverContent>
      </Box>
    </Popover>
  )
}
