import { Popover, PopoverContent, PopoverTrigger, Text } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

type BalPopoverProps = {
  text: string
}

export function BalPopover({ children, text }: PropsWithChildren<BalPopoverProps>) {
  return (
    <Popover trigger="hover">
      <PopoverTrigger>{children}</PopoverTrigger>

      <PopoverContent maxW="300px" p="sm" w="auto">
        <Text fontSize="sm" variant="secondary">
          {text}
        </Text>
      </PopoverContent>
    </Popover>
  )
}
