import { useThemeColorMode } from '@/lib/shared/services/chakra/useThemeColorMode'
import { BoxProps, TextProps, Box, HStack, Text, Tooltip } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'

const tooltipTextDecorationStyles: TextProps = {
  textDecoration: 'underline',
  textDecorationStyle: 'dashed',
  textUnderlineOffset: '4px',
}

interface PopoverAprItemProps extends BoxProps {
  fontWeight?: number
  fontColor?: string

  title: string
  apr: BigNumber
  aprOpacity?: number
  displayValueFormatter: (value: BigNumber) => string

  boxBackground?: string
  textBackground?: string
  textBackgroundClip?: string
  tooltipText?: string
  textVariant?: string
  children?: React.ReactNode
}

export function TooltipAprItem({
  title,
  apr,
  aprOpacity = 1,
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
  ...props
}: PopoverAprItemProps) {
  const colorMode = useThemeColorMode()

  const tootltipTextDecorationColor = colorMode === 'light' ? 'font.secondaryAlpha50' : 'gray.500'

  return (
    <Box fontSize="sm" background={boxBackground} bg={bg} {...props}>
      <HStack justifyContent="space-between">
        <Text
          fontWeight={fontWeight}
          fontSize="sm"
          color={fontColor}
          variant={textVariant}
          background={textBackground}
          backgroundClip={textBackgroundClip}
        >
          {title}
        </Text>
        <Tooltip label={tooltipText} fontSize="sm">
          <Text
            fontWeight={fontWeight}
            fontSize="sm"
            opacity={aprOpacity}
            color={fontColor}
            variant={textVariant}
            {...(tooltipText ? tooltipTextDecorationStyles : {})}
            textDecorationColor={tootltipTextDecorationColor}
          >
            {displayValueFormatter(apr)}
          </Text>
        </Tooltip>
      </HStack>
      {children}
    </Box>
  )
}
