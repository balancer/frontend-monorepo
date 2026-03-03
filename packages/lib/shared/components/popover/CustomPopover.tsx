// CustomPopover.tsx
import { Popover, PopoverProps, Text, HStack, Link } from '@chakra-ui/react';
import { ReactNode, type JSX } from 'react'
import { ArrowUpRight } from 'react-feather'

interface CustomPopoverProps extends Omit<PopoverProps, 'children'> {
  children: ReactNode | ((props: { isOpen: boolean; content: JSX.Element }) => ReactNode)
  useIsOpen?: boolean
  headerText?: string
  bodyText?: string
  footerUrl?: string
  showArrow?: boolean
}

export function CustomPopover({
  children,
  useIsOpen = false,
  headerText,
  bodyText,
  footerUrl,
  showArrow = true,
  ...props
}: CustomPopoverProps) {
  const popoverContent = (
    <Popover.Positioner>
      <Popover.Content maxW="300px" p="sm" w="auto">
        {showArrow && <Popover.Arrow bg="background.level3" />}
        {headerText && (
          <Popover.Title marginInline="0" p="0">
            <Text color="font.primary" fontWeight="bold" pb="sm" size="md">
              {headerText}
            </Text>
          </Popover.Title>
        )}
        {bodyText && (
          <Popover.Body p="0">
            <Text fontSize="sm" pt="sm" variant="secondary">
              {bodyText}
            </Text>
          </Popover.Body>
        )}
        {footerUrl && (
          <Popover.Footer p="0">
            <Link href={footerUrl} variant="link" target='_blank' rel='noopener noreferrer'>
              <HStack gap="xxs">
                <Text color="link" fontSize="sm">
                  Learn more
                </Text>
                <ArrowUpRight size={12} />
              </HStack>
            </Link>
          </Popover.Footer>
        )}
      </Popover.Content>
    </Popover.Positioner>
  )

  const renderTrigger = (isOpen: boolean) => (
    <Popover.Trigger asChild>
      {typeof children === 'function' ? children({ isOpen, content: popoverContent }) : children}
    </Popover.Trigger>
  )

  if (useIsOpen) {
    return (
      <Popover.Root {...props}>
        <Popover.Context>{state => (
            <>
              {renderTrigger(state.isOpen)}
              {popoverContent}
            </>
          )}</Popover.Context>
      </Popover.Root>
    );
  }

  return (
    <Popover.Root {...props}>
      {renderTrigger(false)}
      {popoverContent}
    </Popover.Root>
  );
}
