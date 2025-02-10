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
  Text,
  VStack,
} from '@chakra-ui/react'
import { SwapIcon } from '@repo/lib/shared/components/icons/SwapIcon'
import { staggeredFadeInUp } from '@repo/lib/shared/utils/animations'
import { AnimatePresence, motion } from 'framer-motion'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { MoreVertical } from 'react-feather'
import { isCowAmmPool, shouldBlockAddLiquidity } from '../../pool.helpers'
import { usePool } from '../../PoolProvider'
import { buildCowSwapUrlFromPool } from '@repo/lib/modules/cow/cow.utils'
import { CowIcon } from '@repo/lib/shared/components/icons/logos/CowIcon'

export function PoolAdvancedOptions() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const pathname = usePathname()
  const { pool } = usePool()

  const isCowPool = isCowAmmPool(pool.type)
  const isPoolSwapDisabled = shouldBlockAddLiquidity(pool) || isCowPool

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
                      {isPoolSwapDisabled ? (
                        <Text color="font.button.disabled" cursor="not-allowed" opacity="0.3">
                          Swap through pool
                        </Text>
                      ) : (
                        <Link as={NextLink} href={`${pathname}/swap`} prefetch variant="nav">
                          Swap through pool
                        </Link>
                      )}
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
