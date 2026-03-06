import { BoxProps, Box, HStack, Text, TextProps, Portal, HoverCard } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface Props extends BoxProps {
  fontWeight?: number
  fontColor?: string
  valueFontColor?: string

  title: string
  value: number
  displayValueFormatter: (value: number) => string

  boxBackground?: string
  textBackground?: string
  textBackgroundClip?: string
  tooltipText?: string
  textVariant?: TextProps['variant']
  children?: ReactNode
}

export function TooltipItem({
  title,
  value,
  displayValueFormatter,
  boxBackground,
  bg = 'background.level3',
  textBackground,
  textBackgroundClip,
  children,
  fontWeight,
  fontColor,
  textVariant,
  tooltipText,
  valueFontColor,
  ...props
}: Props) {
  return (
    <Box background={boxBackground} bg={bg} fontSize="sm" {...props}>
      <HStack justifyContent="space-between">
        <Text
          background={textBackground}
          backgroundClip={textBackgroundClip}
          color={fontColor}
          fontSize="sm"
          fontWeight={fontWeight}
          variant={textVariant}
        >
          {title}
        </Text>
        {tooltipText ? (
          <HoverCard.Root>
            <HoverCard.Trigger asChild>
              <Text
                _after={{
                  borderBottom: '1px dotted',
                  borderColor: 'currentColor',
                  bottom: '-2px',
                  content: '""',
                  left: 0,
                  opacity: 0.5,
                  position: 'absolute',
                  width: '100%',
                }}
                color={valueFontColor ?? fontColor}
                fontSize="sm"
                fontWeight={fontWeight}
                position="relative"
                variant={textVariant}
              >
                {displayValueFormatter(value)}
              </Text>
            </HoverCard.Trigger>
            <Portal>
              <HoverCard.Positioner>
                <HoverCard.Content maxW="300px" p="sm" w="auto">
                  <Text fontSize="sm" variant="secondary">
                    {tooltipText}
                  </Text>
                </HoverCard.Content>
              </HoverCard.Positioner>
            </Portal>
          </HoverCard.Root>
        ) : (
          <Text
            color={valueFontColor ?? fontColor}
            fontSize="sm"
            fontWeight={fontWeight}
            variant={textVariant}
          >
            {displayValueFormatter(value)}
          </Text>
        )}
      </HStack>
      {children}
    </Box>
  )
}
