'use client'

import React, { useEffect, useState } from 'react'
import { Box, BoxProps, Card, CardProps, VStack } from '@chakra-ui/react'
import { usePool } from '../../../PoolProvider'
import { NoisyCard } from '@/lib/shared/components/containers/NoisyCard'
import { ZenGarden } from '@/lib/shared/components/zen/ZenGarden'
import ButtonGroup, {
  ButtonGroupOption,
} from '@/lib/shared/components/btns/button-group/ButtonGroup'
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
          {activeTab.value === 'poolStats' && <PoolSnapshotValues />}
          {activeTab.value === 'myStats' && <UserSnapshotValues />}
        </VStack>
      </NoisyCard>
    </Card>
  )
}
