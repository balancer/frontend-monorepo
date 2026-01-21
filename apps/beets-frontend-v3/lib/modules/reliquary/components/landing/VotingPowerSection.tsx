'use client'

import {
  Badge,
  Card,
  Divider,
  HStack,
  Skeleton,
  Switch,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { CheckCircle, XCircle } from 'react-feather'
import { useReliquaryDelegationTransaction } from '../../hooks/useReliquaryDelegationTransaction'
import { useReliquary } from '../../ReliquaryProvider'
import { ReliquaryDelegationModal } from '../ReliquaryDelegationModal'

export function VotingPowerSection() {
  const { totalMaBeetsVP, isLoading } = useReliquary()
  const { isDelegatedToMDs, delegationAddress } = useReliquaryDelegationTransaction()
  const { isOpen, onOpen, onClose } = useDisclosure()

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
            <VStack alignItems="flex-start" spacing="3" width="full">
              <HStack justifyContent="space-between" spacing="2" width="full">
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
              </HStack>
              <VStack align="start" spacing="3" w="full">
                <HStack spacing="2">
                  <Switch colorScheme="green" isChecked={isDelegatedToMDs} onChange={onOpen} />
                  {isDelegatedToMDs && delegationAddress ? (
                    <Text color="gray.400" fontSize="sm">
                      Delegated to: {truncateAddress(delegationAddress)}
                    </Text>
                  ) : (
                    <Text color="gray.400" fontSize="sm">
                      Delegate to Music Directors
                    </Text>
                  )}
                </HStack>
                <Text color="gray.500" fontSize="xs" maxW="500px">
                  Delegate your maBEETS voting power to the Music Directors. This only affects the
                  delegation for the Beets space on Snapshot.
                </Text>
              </VStack>
              {isOpen && (
                <ReliquaryDelegationModal
                  isDelegated={isDelegatedToMDs}
                  isOpen={isOpen}
                  onClose={onClose}
                  onOpen={onOpen}
                />
              )}
            </VStack>
          </VStack>
        </NoisyCard>
      </Card>
    </VStack>
  )
}
