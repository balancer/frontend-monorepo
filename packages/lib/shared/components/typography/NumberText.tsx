import { TextProps, Text } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

export function NumberText({ children, ...rest }: PropsWithChildren & TextProps) {
  return (
    <Text letterSpacing="-0.8px" style={{ fontVariantNumeric: 'tabular-nums ' }} {...rest}>
      {children}
    </Text>
  )
}
