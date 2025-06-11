'use client'

import StarsIcon from '@repo/lib/shared/components/icons/StarsIcon'
import {
  Button,
  Card,
  Flex,
  Box,
  HStack,
  Icon,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import Image from 'next/image'
import Link from 'next/link'
import { getAuraPoolLink, getPoolActionPath, getTotalAprLabel } from '../../../pool.utils'
import { usePool } from '../../../PoolProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { getChainId } from '@repo/lib/config/app.config'
import {
  PartnerRedirectModal,
  RedirectPartner,
} from '@repo/lib/shared/components/modals/PartnerRedirectModal'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { isQuantAmmPool } from '../../../pool.helpers'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'

export function StakingOptions() {
  const { chain, pool } = usePool()

  const { projectName, projectId } = PROJECT_CONFIG
  const canBeNegative = isQuantAmmPool(pool.type)

  const canStake = !!pool.staking
  const stakePath = getPoolActionPath({
    id: pool.id,
    chain: pool.chain,
    action: 'stake',
  })

  const auraDisclosure = useDisclosure()

  return (
    <>
      <Text as="div" mb="ms" fontWeight="bold">
        Staking options to get extra incentives
        <Box
          as="span"
          position="relative"
          top="3px"
          left="5px"
          opacity="0.6"
          _hover={{ opacity: 1 }}
        >
          <Tooltip
            display="inline-block"
            label="You’ve just added liquidity and received LP tokens for a pool eligible for BAL liquidity mining incentives. To earn your share, stake your LP tokens. There’s no lock-up period—you can stake or unstake anytime."
          >
            <InfoIcon display="inline-block" />
          </Tooltip>
        </Box>
      </Text>

      <HStack alignItems="stretch" justify="space-between" w="full" gap="ms">
        <Card position="relative" variant="modalSubSection" p="ms">
          <VStack align="left" spacing="md">
            <Text color="font.maxContrast" fontWeight="bold">
              {projectName}
            </Text>
            <HStack gap="xs">
              <Text color="font.primary" fontSize="md" fontWeight="bold">
                {/* SHOULD WE USE MAX APR instead of the range?? */}
                {/* {fNum('apr', totalApr)} */}
                {/* skip vebal boost here */}
                {getTotalAprLabel(pool.dynamicData.aprItems, undefined, canBeNegative)}
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
        {(PROJECT_CONFIG.options.showVeBal || pool.chain === GqlChain.Optimism) &&
          pool.staking?.aura && (
            <Card position="relative" variant="modalSubSection" p="ms">
              <VStack align="left" spacing="md">
                <Text color="font.maxContrast" fontWeight="bold">
                  Aura
                </Text>
                <HStack>
                  <Text color="font.primary" fontSize="md" fontWeight="bold">
                    {pool.staking?.aura ? fNum('apr', pool.staking.aura.apr) : 'Not available'}
                  </Text>
                </HStack>
                <Flex position="absolute" right={1.5} top={1.5}>
                  <Image alt="balancer" height={30} src="/images/protocols/aura.svg" width={30} />
                </Flex>
                {pool.staking && pool.staking.aura && (
                  <>
                    <Button onClick={auraDisclosure.onOpen} variant="secondary" w="full">
                      Learn more
                    </Button>
                    <PartnerRedirectModal
                      isOpen={auraDisclosure.isOpen}
                      onClose={auraDisclosure.onClose}
                      partner={RedirectPartner.Aura}
                      redirectUrl={getAuraPoolLink(getChainId(chain), pool.staking.aura.auraPoolId)}
                    />
                  </>
                )}
              </VStack>
            </Card>
          )}
      </HStack>
    </>
  )
}
