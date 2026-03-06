import {
  Badge,
  Button,
  Card,
  Flex,
  HStack,
  Skeleton,
  Stack,
  Text,
  VStack,
  useDisclosure,
  Separator,
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
  const { open, onOpen, onClose } = useDisclosure()
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
    <VStack alignItems="flex-start" gap="20" width="full">
      <VStack alignItems="flex-start" gap="4" width="full">
        <Text
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          fontSize="xl"
          fontWeight="bold"
        >
          Your Beets Voting Power
        </Text>
        <Card.Root h="full" w="full">
          <NoisyCard cardProps={{ h: 'full' }}>
            {hasRelics ? (
              <Stack
                alignItems="flex-start"
                direction={{ base: 'column', md: 'row' }}
                gap="6"
                p={{ base: 'sm', md: 'md' }}
                w="full"
              >
                <VStack alignItems="flex-start" gap="2" width="full">
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
                <Separator
                  borderColor="gray.600"
                  display={{ base: 'block', md: 'none' }}
                  orientation="horizontal"
                  width="full"
                />
                <Separator
                  borderColor="gray.600"
                  display={{ base: 'none', md: 'block' }}
                  height="60px"
                  orientation="vertical"
                />
                <VStack alignItems="flex-start" gap="3" width="full">
                  <InfoButton
                    infoText="When active your maBEETS voting power is assigned to the Music Directors for the Beets Gauge Votes space on Snapshot. You can always override this by voting manually. An active delegation does not affect ownership, rewards, or your ability to exit."
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
                      <Badge {...badgeProps} colorPalette="green">
                        <CheckCircle size={12} />
                        <Text>Active</Text>
                      </Badge>
                    ) : (
                      <Badge {...badgeProps} colorPalette="gray">
                        <XCircle size={12} />
                        <Text>Inactive</Text>
                      </Badge>
                    )}
                    <Button onClick={onOpen} size="sm" variant="primary">
                      {isDelegatedToMDs ? 'Deactivate' : 'Activate'}
                    </Button>
                  </HStack>
                  {open && (
                    <ReliquaryDelegationModal
                      isDelegated={isDelegatedToMDs}
                      isOpen={open}
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
        </Card.Root>
      </VStack>
      <VStack alignItems="flex-start" gap="4" width="full">
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
        <Card.Root h="full" w="full">
          <NoisyCard cardProps={{ h: 'full' }}>
            <RelicCarousel focusRelicId={focusRelicId} />
          </NoisyCard>
        </Card.Root>
      </VStack>
    </VStack>
  )
}
