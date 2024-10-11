'use client'

import React, { useState } from 'react'
import { Box, BoxProps, Card, CardProps, VStack } from '@chakra-ui/react'

import { NoisyCard } from '@/lib/shared/components/containers/NoisyCard'
import { ZenGarden } from '@/lib/shared/components/zen/ZenGarden'
import ButtonGroup, {
  ButtonGroupOption,
} from '@/lib/shared/components/btns/button-group/ButtonGroup'

import { UserVebalStatsValues } from '@/lib/modules/vebal/VebalStats/UserVebalStatsValues'
import { AllVebalStatsValues } from '@/lib/modules/vebal/VebalStats/AllVebalStatsValues'

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

const TABS = [
  {
    value: 'allStats',
    label: 'All stats',
  },
  {
    value: 'myStats',
    label: 'My stats',
  },
] as const

export function VebalStats({ ...props }: CardProps) {
  const [activeTab, setActiveTab] = useState<ButtonGroupOption>(TABS[1])

  function handleTabChanged(option: ButtonGroupOption) {
    setActiveTab(option)
  }

  return (
    <Card position="relative" {...props}>
      <NoisyCard
        cardProps={COMMON_NOISY_CARD_PROPS.cardProps}
        contentProps={COMMON_NOISY_CARD_PROPS.contentProps}
      >
        <Box top={0} bottom={0} left={0} right={0} position="absolute" overflow="hidden">
          <ZenGarden variant="circle" sizePx="280px" subdued />
        </Box>
        <VStack
          spacing="xl"
          m="auto"
          align="flex-start"
          w="full"
          justify="flex-start"
          mb="8"
          p={{ base: 'sm', md: 'md' }}
          zIndex={1}
          h="full"
          role="group"
        >
          <ButtonGroup
            size="xxs"
            currentOption={activeTab}
            options={TABS}
            onChange={handleTabChanged}
            groupId="pool-stats"
          />
          {activeTab.value === 'allStats' && <AllVebalStatsValues />}
          {activeTab.value === 'myStats' && <UserVebalStatsValues />}
        </VStack>
      </NoisyCard>
    </Card>
  )
}
