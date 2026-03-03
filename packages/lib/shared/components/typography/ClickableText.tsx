import { Text, TextProps } from '@chakra-ui/react';

export type ClickableTextProps = TextProps

export function ClickableText(props: ClickableTextProps) {
  return (
    <Text
      _focusVisible={{ color: 'font.linkHover' }}
      _hover={{ color: 'font.linkHover' }}
      color={(props.color ?? 'font.link') as string}
      {...props}
    />
  )
}
