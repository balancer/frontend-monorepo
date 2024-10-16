'use client'

import {
  Box,
  Card,
  CardHeader,
  HStack,
  VStack,
  Text,
  GridItem,
  Grid,
  Button,
  Icon,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { HumanAmount } from '@balancer/sdk'
import { LockDurationSlider } from '@repo/lib/modules/vebal/lock/duration/LockDurationSlider'
import { VebalLockDetailsAccordion } from '@repo/lib/modules/vebal/lock/VebalLockDetailsAccordion'
import { VebalLockDetails } from '@repo/lib/modules/vebal/lock/VebalLockDetails'
import StarsIcon from '@repo/lib/shared/components/icons/StarsIcon'
import { useVebalLock } from '@repo/lib/modules/vebal/lock/VebalLockProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { VebalLockModal } from '@repo/lib/modules/vebal/lock/modal/VebalLockModal'
import { useRouter } from 'next/navigation'
import { useVebalLockInfo } from '@repo/lib/modules/vebal/lock/VebalLockInfoProvider'
import { getModalLabel } from '@repo/lib/modules/vebal/lock/steps/lock.helpers'

export function VebalLockForm() {
  const { refetchAll } = useVebalLockInfo()
  const {
    vebalToken,
    humanAmount,
    setHumanAmount,
    isDisabled,
    totalAmount,
    disabledReason,
    previewModalDisclosure,
    lockDuration,
    isLoading,
    lockMode,
    expectedVeBalAmount,
  } = useVebalLock()

  const rewardsGradFrom = useColorModeValue(
    '#F49A55', // light from
    '#F49175' // dark from
  )

  const rewardsGradTo = useColorModeValue(
    '#FCD45B', // light to
    '#FFCC33' // dark to
  )

  const router = useRouter()

  function onModalClose(isSuccess: boolean) {
    previewModalDisclosure.onClose()
    refetchAll()
    if (isSuccess) {
      router.push('/vebal/manage')
    }
  }

  return (
    <Box w="full" maxW="lg" mx="auto" pb="2xl">
      <Card>
        <CardHeader>
          <HStack w="full" justify="space-between">
            <span>{getModalLabel(lockMode, true)}</span>
          </HStack>
        </CardHeader>
        <VStack spacing="lg" align="start" w="full">
          <VStack spacing="sm" align="start" w="full">
            <Text fontSize="sm" lineHeight="18px" fontWeight="700">
              Amount to lock
            </Text>
            <TokenInput
              address={vebalToken.address}
              chain={vebalToken.chain}
              value={humanAmount}
              onChange={e => setHumanAmount(e.currentTarget.value as HumanAmount)}
            />
          </VStack>
          <VStack spacing="sm" align="start" w="full">
            <HStack spacing="md" justifyContent="space-between" w="full">
              <Text fontSize="sm" lineHeight="18px" fontWeight="700">
                Lock duration
              </Text>
              <Tooltip label={lockDuration.lockUntilDateFormatted}>
                <Text fontSize="sm" lineHeight="18px" fontWeight="700">
                  {lockDuration.lockUntilDateDuration}
                </Text>
              </Tooltip>
            </HStack>
            <LockDurationSlider
              value={lockDuration.sliderValue}
              onChange={lockDuration.onSliderChange}
              min={lockDuration.minStep}
              max={lockDuration.maxStep}
              step={lockDuration.stepSize}
              steps={lockDuration.steps}
              minValue={lockDuration.minSliderValue}
            />
          </VStack>
          <VebalLockDetailsAccordion
            accordionPanelComponent={
              <VebalLockDetails
                variant="detailed"
                totalAmount={totalAmount}
                lockUntilDateFormatted={lockDuration.lockUntilDateFormatted}
                expectedVeBalAmount={expectedVeBalAmount}
              />
            }
          />

          <Grid w="full" templateColumns="1fr 1fr" gap="sm">
            <GridItem>
              <Card minHeight="full" variant="subSection" w="full" p={['sm', 'ms']}>
                <VStack align="start" gap="sm">
                  <Text fontSize="sm" lineHeight="16px" fontWeight="500">
                    Total veBAL
                  </Text>
                  <Text fontSize="md" lineHeight="16px" fontWeight="700">
                    {totalAmount.eq(0) ? '-' : fNum('token', totalAmount)}
                  </Text>
                </VStack>
              </Card>
            </GridItem>
            <GridItem>
              <Card minHeight="full" variant="subSection" w="full" p={['sm', 'ms']}>
                <VStack align="start" gap="sm">
                  <Text variant="special" fontSize="sm" lineHeight="16px" fontWeight="500">
                    Potential min. weekly yield
                  </Text>
                  <HStack spacing="xs">
                    <Text variant="special" fontSize="md" lineHeight="16px" fontWeight="700">
                      {/* fix: mocked */}
                      $15.56
                    </Text>

                    <Icon as={StarsIcon} gradFrom={rewardsGradFrom} gradTo={rewardsGradTo} />
                  </HStack>
                </VStack>
              </Card>
            </GridItem>
          </Grid>
          <Tooltip label={isDisabled ? disabledReason : undefined}>
            <Button
              isDisabled={isDisabled}
              isLoading={isLoading}
              onClick={previewModalDisclosure.onOpen}
              w="full"
              variant="primary"
            >
              Next
            </Button>
          </Tooltip>
        </VStack>
      </Card>
      <VebalLockModal
        isOpen={previewModalDisclosure.isOpen}
        onClose={onModalClose}
        extendExpired={true}
      />
    </Box>
  )
}
