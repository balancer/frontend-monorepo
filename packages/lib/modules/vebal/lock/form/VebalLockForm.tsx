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
  Tooltip,
} from '@chakra-ui/react'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { HumanAmount } from '@balancer/sdk'
import { LockDurationSlider } from '@repo/lib/modules/vebal/lock/duration/LockDurationSlider'
import { VebalLockDetailsAccordion } from '@repo/lib/modules/vebal/lock/VebalLockDetailsAccordion'
import { VebalLockDetails } from '@repo/lib/modules/vebal/lock/VebalLockDetails'
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
    lpToken,
    setLpToken,
    isDisabled,
    disabledReason,
    previewModalDisclosure,
    lockDuration,
    isLoading,
    lockMode,
    expectedVeBalAmount,
  } = useVebalLock()

  const router = useRouter()

  function onModalClose(isSuccess: boolean) {
    previewModalDisclosure.onClose()
    refetchAll()
    if (isSuccess) {
      router.push('/vebal/manage')
    }
  }

  return (
    <Box maxW="lg" mx="auto" pb="2xl" w="full">
      <Card>
        <CardHeader>
          <HStack justify="space-between" w="full">
            <span>{getModalLabel(lockMode, true)}</span>
          </HStack>
        </CardHeader>
        <VStack align="start" spacing="lg" w="full">
          <VStack align="start" spacing="sm" w="full">
            <Text fontSize="sm" fontWeight="700" lineHeight="18px">
              Amount to lock
            </Text>
            <TokenInput
              address={vebalToken.address}
              chain={vebalToken.chain}
              onChange={e => setLpToken(e.currentTarget.value as HumanAmount)}
              value={lpToken}
            />
          </VStack>
          <VStack align="start" spacing="sm" w="full">
            <HStack justifyContent="space-between" spacing="md" w="full">
              <Text fontSize="sm" fontWeight="700" lineHeight="18px">
                Lock duration
              </Text>
              <Tooltip label={lockDuration.lockUntilDateFormatted}>
                <Text fontSize="sm" fontWeight="700" lineHeight="18px">
                  {lockDuration.lockUntilDateDuration}
                </Text>
              </Tooltip>
            </HStack>
            <LockDurationSlider
              max={lockDuration.maxStep}
              min={lockDuration.minStep}
              minValue={lockDuration.minSliderValue}
              onChange={lockDuration.onSliderChange}
              step={lockDuration.stepSize}
              steps={lockDuration.steps}
              value={lockDuration.sliderValue}
            />
          </VStack>
          <VebalLockDetailsAccordion
            accordionPanelComponent={<VebalLockDetails variant="detailed" />}
          />

          <Grid gap="sm" templateColumns="1fr 1fr" w="full">
            <GridItem>
              <Card minHeight="full" p={['sm', 'ms']} variant="subSection" w="full">
                <VStack align="start" gap="sm">
                  <Text fontSize="sm" fontWeight="500" lineHeight="16px">
                    Total veBAL
                  </Text>
                  <Text fontSize="md" fontWeight="700" lineHeight="16px">
                    {expectedVeBalAmount.totalExpectedVeBal.eq(0)
                      ? '-'
                      : fNum('token', expectedVeBalAmount.totalExpectedVeBal)}
                  </Text>
                </VStack>
              </Card>
            </GridItem>
            <GridItem>
              {/* TO-DO Potential min. weekly yield */}
              {/* <Card minHeight="full" variant="subSection" w="full" p={['sm', 'ms']}>
                <VStack align="start" gap="sm">
                  <Text variant="special" fontSize="sm" lineHeight="16px" fontWeight="500">
                    Potential min. weekly yield
                  </Text>
                  <HStack spacing="xs">
                    <Text variant="special" fontSize="md" lineHeight="16px" fontWeight="700">
                      $15.56
                    </Text>

                    <Icon as={StarsIcon} gradFrom={rewardsGradFrom} gradTo={rewardsGradTo} />
                  </HStack>
                </VStack>
              </Card> */}
            </GridItem>
          </Grid>
          <Tooltip label={isDisabled ? disabledReason : undefined}>
            <Button
              isDisabled={isDisabled}
              isLoading={isLoading}
              onClick={previewModalDisclosure.onOpen}
              variant="primary"
              w="full"
            >
              Next
            </Button>
          </Tooltip>
        </VStack>
      </Card>
      <VebalLockModal extendExpired isOpen={previewModalDisclosure.isOpen} onClose={onModalClose} />
    </Box>
  )
}
