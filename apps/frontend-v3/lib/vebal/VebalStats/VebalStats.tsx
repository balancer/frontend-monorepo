'use client'

import { Box, BoxProps, Card, CardProps, VStack, useColorMode } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { UserVebalStatsValues } from './UserVebalStatsValues'
import { RadialPattern } from '@bal/app/(marketing)/_lib/landing-v3/shared/RadialPattern'

const COMMON_NOISY_CARD_PROPS: { contentProps: BoxProps; cardProps: BoxProps } = {
  contentProps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 'none',
    borderTopLeftRadius: 'none',
    borderBottomRightRadius: 'none',
  },
  cardProps: {
    position: 'relative',
    height: 'full',
  },
}

export function VebalStats({ ...props }: CardProps) {
  const { colorMode } = useColorMode()

  return (
    <Card position="relative" {...props}>
      <NoisyCard
        cardProps={COMMON_NOISY_CARD_PROPS.cardProps}
        contentProps={COMMON_NOISY_CARD_PROPS.contentProps}
      >
        <Box bottom={0} left={0} overflow="hidden" position="absolute" right={0} top={0}>
          <RadialPattern
            circleCount={8}
            height={600}
            innerHeight={60}
            innerWidth={60}
            left="calc(50% - 300px)"
            opacity={colorMode === 'dark' ? 0.4 : 0.75}
            pointerEvents="none"
            position="absolute"
            top="-120px"
            width={600}
            zIndex={0}
          />
        </Box>
        <VStack
          align="flex-start"
          h="full"
          justify="flex-start"
          m="auto"
          p={{ base: 'lg', md: 'lg' }}
          role="group"
          spacing="xl"
          w="full"
          zIndex={1}
        >
          <UserVebalStatsValues />
        </VStack>
      </NoisyCard>
    </Card>
  )
}
