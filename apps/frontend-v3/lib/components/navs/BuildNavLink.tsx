import { useEffect, useRef } from 'react'
import { Popover, Link, Portal, useDisclosure } from '@chakra-ui/react';
import { BuildPopover } from './BuildPopover'
import { AnalyticsEvent, trackEvent } from '@repo/lib/shared/services/fathom/Fathom'

export function BuildNavLink() {
  const { open, onOpen, onClose } = useDisclosure()
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (open) {
        onClose()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!open) return
      const target = event.target as Node
      const isClickInsideTrigger = triggerRef.current?.contains(target)
      const isClickInsidePopover = popoverRef.current?.contains(target)
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
  }, [open, onClose])

  const handleToggle = () => {
    trackEvent(AnalyticsEvent.ClickNavBuild)
    if (open) {
      onClose()
    } else {
      onOpen()
    }
  }

  return (
    <Popover.Root closeOnInteractOutside={false} open={open} positioning={{
      placement: 'bottom'
    }}>
      <Popover.Trigger asChild>
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
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            _focus={{ borderColor: 'transparent !important' }}
            ref={popoverRef}
            rounded="lg"
            w="fit-content">
            <Popover.Arrow bg="background.level3" />
            <Popover.Body p={{ base: 'ms', md: 'md' }}>
              <BuildPopover closePopover={onClose} />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
