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
import { ReactNode } from 'react'
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
        <PopoverHeader>
          <Text color="font.primary" fontWeight="bold" size="md">
            {headerText}
          </Text>
        </PopoverHeader>
      )}
      {bodyText && (
        <PopoverBody>
          <Text fontSize="sm" variant="secondary">
            {bodyText}
          </Text>
        </PopoverBody>
      )}
      {footerUrl && (
        <PopoverFooter>
          <Link href={footerUrl} target="_blank" variant="link">
            <HStack gap="xxs">
              <Text color="link">Learn more</Text>
              <ArrowUpRight size={12} />
            </HStack>
          </Link>
        </PopoverFooter>
      )}
    </PopoverContent>
  )

  if (useIsOpen) {
    return (
      <Popover {...props}>
        {state => (
          <>
            <PopoverTrigger>
              {typeof children === 'function'
                ? children({ isOpen: state.isOpen, content: popoverContent })
                : children}
            </PopoverTrigger>
            {popoverContent}
          </>
        )}
      </Popover>
    )
  }

  return (
    <Popover {...props}>
      <PopoverTrigger>
        {typeof children === 'function'
          ? children({ isOpen: props.isOpen ?? false, content: popoverContent } as any)
          : children}
      </PopoverTrigger>
      {popoverContent}
    </Popover>
  )
}
