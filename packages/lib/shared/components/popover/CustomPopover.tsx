// CustomPopover.tsx
import {
  Popover,
  PopoverProps,
  PopoverTrigger,
  Text,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
  PopoverFooter,
  HStack,
  Link,
} from '@chakra-ui/react'
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
    <PopoverContent maxW="300px" p="sm" w="auto">
      {showArrow && <PopoverArrow bg="background.level3" />}
      {headerText && (
        <PopoverHeader marginInline="0" p="0">
          <Text color="font.primary" fontWeight="bold" pb="sm" size="md">
            {headerText}
          </Text>
        </PopoverHeader>
      )}
      {bodyText && (
        <PopoverBody p="0">
          <Text fontSize="sm" pt="sm" variant="secondary">
            {bodyText}
          </Text>
        </PopoverBody>
      )}
      {footerUrl && (
        <PopoverFooter p="0">
          <Link href={footerUrl} isExternal variant="link">
            <HStack gap="xxs">
              <Text color="link" fontSize="sm">
                Learn more
              </Text>
              <ArrowUpRight size={12} />
            </HStack>
          </Link>
        </PopoverFooter>
      )}
    </PopoverContent>
  )

  const renderTrigger = (isOpen: boolean) => (
    <PopoverTrigger>
      {typeof children === 'function' ? children({ isOpen, content: popoverContent }) : children}
    </PopoverTrigger>
  )

  if (useIsOpen) {
    return (
      <Popover {...props}>
        {state => (
          <>
            {renderTrigger(state.isOpen)}
            {popoverContent}
          </>
        )}
      </Popover>
    )
  }

  return (
    <Popover {...props}>
      {renderTrigger(false)}
      {popoverContent}
    </Popover>
  )
}
