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
        <Tooltip fontSize="sm" label={tooltipText}>
          <Text
            color={fontColor}
            fontSize="sm"
            fontWeight={fontWeight}
            opacity={aprOpacity}
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
