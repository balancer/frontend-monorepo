'use client'

import {
  Box,
  Button,
  HStack,
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
import { shouldBlockAddLiquidity } from '../../pool.helpers'
import { usePool } from '../../PoolProvider'

export function PoolAdvancedOptions() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const pathname = usePathname()
  const { pool } = usePool()

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
                  <HStack>
                    <SwapIcon size={20} />
                    <Button
                      as={NextLink}
                      href={`${pathname}/swap`}
                      isDisabled={shouldBlockAddLiquidity(pool)}
                      size="lg"
                      variant="primary"
                      w="full"
                    >
                      Swap through pool
                    </Button>
                  </HStack>
                </VStack>
              ) : null}
            </AnimatePresence>
          </PopoverBody>
        </PopoverContent>
      </Box>
    </Popover>
  )
}
