'use client'

import { Box, BoxProps, Card, CardProps, VStack } from '@chakra-ui/react'

import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { UserVebalStatsValues } from '@repo/lib/modules/vebal/VebalStats/UserVebalStatsValues'

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
  return (
    <Card position="relative" {...props}>
      <NoisyCard
        cardProps={COMMON_NOISY_CARD_PROPS.cardProps}
        contentProps={COMMON_NOISY_CARD_PROPS.contentProps}
      >
        <Box bottom={0} left={0} overflow="hidden" position="absolute" right={0} top={0}>
          <ZenGarden sizePx="280px" subdued variant="circle" />
        </Box>
        <VStack
          align="flex-start"
          h="full"
          justify="flex-start"
          m="auto"
          mb="8"
          p={{ base: 'sm', md: 'md' }}
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
