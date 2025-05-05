'use client'

import React, { useEffect, useState } from 'react'
import { Box, BoxProps, Card, CardProps, VStack } from '@chakra-ui/react'
import { usePool } from '../../../PoolProvider'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { UserSnapshotValues } from './UserSnapshotValues'
import { PoolSnapshotValues } from './PoolSnapshotValues'
import { hasTotalBalance } from '../../../user-balance.helpers'

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
    value: 'poolStats',
    label: 'Pool stats',
  },
  {
    value: 'myStats',
    label: 'My stats',
  },
] as const

export function PoolSnapshot({ ...props }: CardProps) {
  const [activeTab, setActiveTab] = useState<ButtonGroupOption>(TABS[0])
  const { pool } = usePool()

  function handleTabChanged(option: ButtonGroupOption) {
    setActiveTab(option)
  }

  useEffect(() => {
    if (hasTotalBalance(pool)) {
      setActiveTab(TABS[1])
    }
  }, [pool])

  return (
    <Card h={{ base: '475px', md: '525px' }} position="relative" {...props}>
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
          <ButtonGroup
            currentOption={activeTab}
            groupId="pool-stats"
            onChange={handleTabChanged}
            options={TABS}
            size="xxs"
          />
          {activeTab.value === 'poolStats' && <PoolSnapshotValues />}
          {activeTab.value === 'myStats' && <UserSnapshotValues />}
        </VStack>
      </NoisyCard>
    </Card>
  )
}
