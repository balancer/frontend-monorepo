'use client'

import StarsIcon from '@repo/lib/shared/components/icons/StarsIcon'
import { Button, Card, Flex, HStack, Icon, Text, useDisclosure, VStack } from '@chakra-ui/react'
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
import { getProjectConfig, isBalancerProject } from '@repo/lib/config/getProjectConfig'

export function StakingOptions() {
  const { chain, pool } = usePool()
  const canStake = !!pool.staking
  const stakePath = getPoolActionPath({
    id: pool.id,
    chain: pool.chain,
    action: 'stake',
  })

  const auraDisclosure = useDisclosure()

  const projectConfig = getProjectConfig()

  return (
    <>
      <Text mb="2">Staking options</Text>
      <HStack alignItems="stretch" justify="space-between" w="full">
        <Card position="relative" variant="modalSubSection">
          <VStack align="left" spacing="md">
            <Text color="grayText">{projectConfig.projectName}</Text>
            <HStack>
              <Text color="font.primary" fontSize="md" fontWeight="bold">
                {/* SHOULD WE USE MAX APR instead of the range?? */}
                {/* {fNum('apr', totalApr)} */}
                {getTotalAprLabel(pool.dynamicData.aprItems)}
              </Text>
              <Icon as={StarsIcon} height="20px" width="20px" />
            </HStack>
            <Flex position="absolute" right={2} top={3}>
              <Image
                alt={projectConfig.projectId}
                height={30}
                src={`/images/protocols/${projectConfig.projectId}.svg`}
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
        {isBalancerProject() && pool.staking?.aura && (
          <Card position="relative" variant="modalSubSection">
            <VStack align="left" spacing="md">
              <Text color="grayText">Aura</Text>
              <HStack>
                <Text color="font.primary" fontSize="md" fontWeight="bold">
                  {pool.staking?.aura ? fNum('apr', pool.staking.aura.apr) : 'Not available'}
                </Text>
              </HStack>
              <Flex position="absolute" right={2} top={3}>
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
