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
      onOpen={() => setIsPopoverOpen(true)}
      onClose={() => setIsPopoverOpen(false)}
      placement="bottom-end"
    >
      <PopoverTrigger>
        <Button variant="tertiary" size="lg" color="grayText">
          {<MoreVertical size={16} />}
        </Button>
      </PopoverTrigger >
      <Box zIndex="popover" shadow="2xl" width="max">
        <PopoverContent>
          <PopoverArrow bg="background.level3" />
          <PopoverCloseButton top="sm" />
          <PopoverBody p="lg">
            <AnimatePresence>
              {isPopoverOpen && (
                <VStack
                  align="start"
                  spacing="xxs"
                  as={motion.div}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={staggeredFadeInUp}
                >
                  <HStack>
                    <SwapIcon size={24} />
                    <Link as={NextLink} href={`${pathname}/swap`} prefetch={true} variant="nav">
                      Swap tokens directly via this pool
                    </Link>
                  </HStack>
                </VStack>
              )}
            </AnimatePresence>
          </PopoverBody>
        </PopoverContent>
      </Box>
    </Popover>
  )
}
