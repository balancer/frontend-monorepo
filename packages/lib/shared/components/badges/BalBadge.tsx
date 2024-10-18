import { Badge, BadgeProps } from '@chakra-ui/react'

export function BalBadge({ children, ...props }: BadgeProps) {
  return (
    <Badge
      fontWeight="normal"
      py="xs"
      px="sm"
      background="background.level2"
      border="1px solid"
      borderColor="border.base"
      shadow="sm"
      rounded="full"
      display="flex"
      alignItems="center"
      {...props}
    >
      {children}
    </Badge>
  )
}
