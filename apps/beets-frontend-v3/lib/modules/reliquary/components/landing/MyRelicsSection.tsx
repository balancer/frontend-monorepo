import {
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  HStack,
  Skeleton,
  Stack,
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
import { RelicCarousel } from '../RelicCarousel'
import { useRouter } from 'next/navigation'
import { InfoButton } from '@/lib/components/info-button/InfoButton'

type Props = {
  focusRelicId?: string | null
  isConnected: boolean
}

export function MyRelicsSection({ focusRelicId, isConnected }: Props) {
  const { totalMaBeetsVP, isLoading, relicPositions } = useReliquary()
  const { isDelegatedToMDs } = useReliquaryDelegationTransaction()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()

  const hasRelics = relicPositions.length > 0

  const badgeProps = {
    alignItems: 'center',
    borderRadius: 'lg',
    display: 'flex',
    gap: '1',
    px: '4',
    py: '2',
  }

  return (
    <VStack alignItems="flex-start" spacing="20" width="full">
      <VStack alignItems="flex-start" spacing="4" width="full">
        <Text
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          fontSize="xl"
          fontWeight="bold"
        >
          Your Beets Voting Power
        </Text>
        <Card h="full" w="full">
          <NoisyCard cardProps={{ h: 'full' }}>
            {hasRelics ? (
              <Stack
                alignItems="flex-start"
                direction={{ base: 'column', md: 'row' }}
                p={{ base: 'sm', md: 'md' }}
                spacing="6"
                w="full"
              >
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
                <Divider
                  borderColor="gray.600"
                  display={{ base: 'block', md: 'none' }}
                  orientation="horizontal"
                  width="full"
                />
                <Divider
                  borderColor="gray.600"
                  display={{ base: 'none', md: 'block' }}
                  height="90px"
                  orientation="vertical"
                />
                <VStack alignItems="flex-start" spacing="3" width="full">
                  <InfoButton
                    infoText="Delegate or undelegate your maBEETS voting power to the Music Directors. This only affects the delegation for the Beets Gauge Votes space on Snapshot."
                    label="Vote Optimizer Status"
                    labelProps={{
                      lineHeight: '1rem',
                      fontWeight: 'semibold',
                      fontSize: 'sm',
                      color: 'beets.base.50',
                    }}
                  />
                  <HStack>
                    {isDelegatedToMDs ? (
                      <Badge {...badgeProps} colorScheme="green">
                        <CheckCircle size={12} />
                        <Text>Active</Text>
                      </Badge>
                    ) : (
                      <Badge {...badgeProps} colorScheme="gray">
                        <XCircle size={12} />
                        <Text>Inactive</Text>
                      </Badge>
                    )}
                    <Button onClick={onOpen} size="sm" variant="primary">
                      {isDelegatedToMDs ? 'Deactivate' : 'Activate'}
                    </Button>
                  </HStack>
                  {isOpen && (
                    <ReliquaryDelegationModal
                      isDelegated={isDelegatedToMDs}
                      isOpen={isOpen}
                      onClose={onClose}
                      onOpen={onOpen}
                    />
                  )}
                </VStack>
              </Stack>
            ) : (
              <VStack alignItems="center" justifyContent="center" py="16">
                <Text color="gray.400" fontSize="lg" textAlign="center">
                  Create a maBEETS position to start building maturity-adjusted voting power
                </Text>
              </VStack>
            )}
          </NoisyCard>
        </Card>
      </VStack>
      <VStack alignItems="flex-start" spacing="4" width="full">
        <Flex alignItems="center" justifyContent="space-between" width="full">
          <Text
            background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
            backgroundClip="text"
            fontSize="xl"
            fontWeight="bold"
          >
            Your Relics
          </Text>
          {isConnected && (
            <Button
              onClick={() => router.push('/mabeets/add-liquidity/new')}
              size="md"
              variant="primary"
            >
              Create New Relic
            </Button>
          )}
        </Flex>
        <Card h="full" w="full">
          <NoisyCard cardProps={{ h: 'full' }}>
            <RelicCarousel focusRelicId={focusRelicId} />
          </NoisyCard>
        </Card>
      </VStack>
    </VStack>
  )
}
