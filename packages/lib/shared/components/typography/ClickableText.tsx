import { useClickable } from '@chakra-ui/clickable'
import { Text, TextProps } from '@chakra-ui/react'

export type ClickableTextProps = TextProps

export function ClickableText(props: ClickableTextProps) {
  const clickableProps = useClickable({
    _focusVisible: { color: 'font.linkHover' },
    _hover: { color: 'font.linkHover' },
    ...props,
    color: (props.color ?? 'font.link') as string,
  })
  return <Text {...clickableProps} />
}
