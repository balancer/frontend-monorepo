'use client'

import StarsIcon from '@repo/lib/shared/components/icons/StarsIcon'
import { Button, Card, Flex, Box, HStack, Icon, Text, Tooltip, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import Link from 'next/link'
import { getPoolActionPath, getTotalAprLabel } from '../../../pool.utils'
import { usePool } from '../../../PoolProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { isQuantAmmPool } from '../../../pool.helpers'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'

export function StakingOptions() {
  const { pool } = usePool()

  const { projectName, projectId } = PROJECT_CONFIG
  const canBeNegative = isQuantAmmPool(pool.type)

  const canStake = !!pool.staking
  const stakePath = getPoolActionPath({
    id: pool.id,
    chain: pool.chain,
    action: 'stake',
  })

  return (
    <>
      <Text as="div" fontWeight="bold" mb="ms">
        Staking options to get extra incentives
        <Box
          _hover={{ opacity: 1 }}
          as="span"
          left="5px"
          opacity="0.6"
          position="relative"
          top="3px"
        >
          <Tooltip
            display="inline-block"
            label="You’ve just added liquidity and received LP tokens for a pool eligible for liquidity mining incentives. To earn your share, stake your LP tokens. There’s no lock-up period—you can stake or unstake anytime."
          >
            <InfoIcon display="inline-block" />
          </Tooltip>
        </Box>
      </Text>

      <HStack alignItems="stretch" gap="ms" justify="space-between" w="full">
        <Card p="ms" position="relative" variant="modalSubSection">
          <VStack align="left" spacing="md">
            <Text color="font.maxContrast" fontWeight="bold">
              {projectName}
            </Text>
            <HStack gap="xs">
              <Text color="font.primary" fontSize="md" fontWeight="bold">
                {/* SHOULD WE USE MAX APR instead of the range?? */}
                {/* {fNum('apr', totalApr)} */}
                {getTotalAprLabel(pool.dynamicData.aprItems, canBeNegative)}
              </Text>
              <Icon as={StarsIcon} height="16px" width="16px" />
            </HStack>
            <Flex position="absolute" right={1.5} top={1.5}>
              <Image
                alt={projectId}
                height={30}
                src={`/images/protocols/${projectId}.svg`}
                width={30}
              />
            </Flex>
            <Button
              as={Link}
              href={stakePath}
              isDisabled={!canStake}
              prefetch
              variant={canStake ? 'primary' : 'disabled'}
              w="full"
            >
              Stake
            </Button>
          </VStack>
        </Card>
      </HStack>
    </>
  )
}
