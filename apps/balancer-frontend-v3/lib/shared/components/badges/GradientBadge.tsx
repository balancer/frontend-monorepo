import { Badge, BadgeProps, Text } from '@chakra-ui/react'
import React from 'react'

export default function GradientBadge({ children, ...rest }: BadgeProps) {
  return (
    <Badge {...rest} backgroundColor="background.level2" py="1" px="2">
      <Text color="font.primary" fontSize="sm" fontWeight="medium" textTransform="capitalize">
        {children}
      </Text>
    </Badge>
  )
}
