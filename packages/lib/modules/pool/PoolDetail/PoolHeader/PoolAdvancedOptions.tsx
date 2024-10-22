'use client'

import {
  Box,
  Button,
  HStack,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
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

export function PoolAdvancedOptions() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const pathname = usePathname()

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
          <PopoverCloseButton top="sm" />
          <PopoverBody p="lg">
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
                    <SwapIcon size={24} />
                    <Link as={NextLink} href={`${pathname}/swap`} prefetch variant="nav">
                      Swap tokens directly via this pool
                    </Link>
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
