/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useEffect, useState } from 'react'
import { Box, BoxProps, Card, CardProps, VStack, useColorMode } from '@chakra-ui/react'
import { usePool } from '../../../PoolProvider'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { UserSnapshotValues } from './UserSnapshotValues'
import { PoolSnapshotValues } from './PoolSnapshotValues'
import { hasTotalBalance } from '../../../user-balance.helpers'
import { RadialPattern } from '@repo/lib/shared/components/zen/RadialPattern'

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
  const { colorMode } = useColorMode()

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
        <Box bottom={0} left={0} overflow="hidden" position="absolute" right={0} top={0}>
          <RadialPattern
            circleCount={8}
            height={800}
            innerHeight={150}
            innerWidth={150}
            left="calc(50% - 400px)"
            opacity={colorMode === 'dark' ? 0.35 : 0.45}
            pointerEvents="none"
            position="absolute"
            top="-180px"
            width={800}
            zIndex={0}
          />
        </Box>
        <VStack
          align="flex-start"
          gap="20px"
          h="full"
          justify="flex-start"
          m="auto"
          mb="sm"
          p="md"
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
