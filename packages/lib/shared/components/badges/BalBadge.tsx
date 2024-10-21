import { Badge, BadgeProps } from '@chakra-ui/react'

export function BalBadge({ children, ...props }: BadgeProps) {
  return (
    <Badge
      alignItems="center"
      background="background.level2"
      border="1px solid"
      borderColor="border.base"
      display="flex"
      fontWeight="normal"
      px="sm"
      py="xs"
      rounded="full"
      shadow="sm"
      {...props}
    >
      {children}
    </Badge>
  )
}
