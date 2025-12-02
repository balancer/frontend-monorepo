'use client'

import {
  Badge,
  Box,
  Card,
  Divider,
  HStack,
  Skeleton,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { CheckCircle, XCircle } from 'react-feather'
import { useDelegateClearStep } from '../../hooks/useDelegateClearStep'
import { useDelegateSetStep } from '../../hooks/useDelegateSetStep'
import { useDelegation } from '../../hooks/useDelegation'
import { useReliquary } from '../../ReliquaryProvider'

export function VotingPowerSection() {
  const { totalMaBeetsVP, isLoading } = useReliquary()
  const { data: isDelegatedToMDs, delegationAddress } = useDelegation()
  const { step: delegateSetStep } = useDelegateSetStep(GqlChain.Sonic)
  const { step: delegateClearStep } = useDelegateClearStep(GqlChain.Sonic)

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <VStack alignItems="flex-start" spacing="4" width="full">
      <Text
        background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
        backgroundClip="text"
        fontSize="xl"
        fontWeight="bold"
      >
        Voting Power
      </Text>

      <Card h="full" w="full">
        <NoisyCard cardProps={{ h: 'full' }}>
          <VStack alignItems="flex-start" p={{ base: 'sm', md: 'md' }} spacing="6" w="full">
            {/* Total Voting Power */}
            <VStack alignItems="flex-start" spacing="2" width="full">
              <Text color="beets.base.50" fontSize="sm" fontWeight="semibold">
                Total Voting Power
              </Text>
              {!isLoading ? (
                <Text color="white" fontSize="1.75rem" fontWeight="bold">
                  {fNumCustom(totalMaBeetsVP, '0.000a')} maBEETS
                </Text>
              ) : (
                <Skeleton height="32px" width="150px" />
              )}
            </VStack>

            <Divider />

            {/* Delegation Status */}
            <VStack alignItems="flex-start" spacing="3" width="full">
              <HStack spacing="2">
                <Text color="beets.base.50" fontSize="sm" fontWeight="semibold">
                  Delegation Status
                </Text>
                {isDelegatedToMDs ? (
                  <Badge alignItems="center" colorScheme="green" display="flex" gap="1">
                    <CheckCircle size={12} />
                    <Text>Active</Text>
                  </Badge>
                ) : (
                  <Badge alignItems="center" colorScheme="gray" display="flex" gap="1">
                    <XCircle size={12} />
                    <Text>Inactive</Text>
                  </Badge>
                )}
              </HStack>

              {isDelegatedToMDs && delegationAddress && (
                <Text color="gray.400" fontSize="sm">
                  Delegated to: {truncateAddress(delegationAddress)}
                </Text>
              )}

              {/* Delegation Button */}
              <Tooltip label="Delegate or undelegate your maBEETS voting power to the Music Directors. This only affects the delegation for the Beets space on Snapshot.">
                <Box width={{ base: 'full', md: 'auto' }}>
                  <Box
                    sx={{
                      '& button': {
                        size: 'md',
                        variant: 'tertiary',
                        fontSize: 'sm',
                        px: '4',
                        py: '2',
                        height: 'auto',
                      },
                    }}
                  >
                    {isDelegatedToMDs
                      ? delegateClearStep.renderAction()
                      : delegateSetStep.renderAction()}
                  </Box>
                </Box>
              </Tooltip>
            </VStack>
          </VStack>
        </NoisyCard>
      </Card>
    </VStack>
  )
}
