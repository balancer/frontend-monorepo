'use client'

import { ReactNode } from 'react'
import { Box, BoxProps, Center, Text, TextProps } from '@chakra-ui/react'
import { RadialPattern, RadialPatternProps } from './RadialPattern'
import { GraniteBg } from './GraniteBg'

type FeatureCardProps = {
  title: string
  subTitle?: string
  label?: string
  icon?: ReactNode
  stat?: string
  featureOpacity?: number
  titleSize?: string
  radialPatternProps?: RadialPatternProps
  statProps?: TextProps
  iconProps?: BoxProps
}

export function FeatureCard({
  title,
  subTitle,
  icon,
  label,
  stat,
  featureOpacity = 1,
  titleSize = 'xl',
  radialPatternProps,
  statProps,
  iconProps,
  ...rest
}: FeatureCardProps & BoxProps) {
  return (
    <Box minH="175px" overflow="hidden" position="relative" rounded="lg" shadow="2xl" {...rest}>
      <GraniteBg />
      <RadialPattern
        circleCount={8}
        height={180}
        padding="15px"
        position="absolute"
        right={-50}
        top={-50}
        width={180}
        {...radialPatternProps}
      >
        <Center color="white" h="full" opacity={featureOpacity} w="full" {...iconProps}>
          {icon && icon}
          {stat && (
            <Text fontSize="2xl" {...statProps}>
              {stat}
            </Text>
          )}
        </Center>
      </RadialPattern>
      {label && (
        <Text
          background="font.secondary"
          backgroundClip="text"
          fontSize="xs"
          left="0"
          p="md"
          position="absolute"
          textTransform="uppercase"
          top="0"
        >
          {label}
        </Text>
      )}
      <Box bottom="0" left="0" p="md" position="absolute">
        <Text fontSize={titleSize} fontWeight="bold">
          {title}
        </Text>
        {subTitle && (
          <Text fontSize="xl" opacity={0.6}>
            {subTitle}
          </Text>
        )}
      </Box>
    </Box>
  )
}
