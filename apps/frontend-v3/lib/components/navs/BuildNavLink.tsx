'use client'

import { useEffect, useRef } from 'react'
import {
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Link,
  Portal,
  useDisclosure,
} from '@chakra-ui/react'
import { BuildPopover } from './BuildPopover'

export function BuildNavLink() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        onClose()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return

      const target = event.target as Node
      const isClickInsideTrigger = triggerRef.current?.contains(target)
      const isClickInsidePopover = popoverRef.current?.contains(target)

      // Close if click is outside both trigger and popover content
      if (!isClickInsideTrigger && !isClickInsidePopover) {
        onClose()
      }
    }

    window.addEventListener('scroll', handleScroll, true)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleToggle = () => {
    if (isOpen) {
      onClose()
    } else {
      onOpen()
    }
  }

  return (
    <Popover closeOnBlur={false} isOpen={isOpen} placement="bottom">
      <PopoverTrigger>
        <Link
          bg="transparent"
          cursor="pointer"
          fontWeight="medium"
          onClick={handleToggle}
          ref={triggerRef}
          variant="nav"
        >
          Build
        </Link>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          _focus={{ borderColor: 'transparent !important' }}
          ref={popoverRef}
          rounded="xl"
          w="fit-content"
        >
          <PopoverArrow bg="background.level3" />
          <PopoverBody p={{ base: 'ms', md: 'md' }}>
            <BuildPopover />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
