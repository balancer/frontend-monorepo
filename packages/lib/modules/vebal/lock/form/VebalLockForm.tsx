'use client'

import {
  Box,
  Button,
  Card,
  CardHeader,
  Grid,
  GridItem,
  HStack,
  Skeleton,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { HumanAmount } from '@balancer/sdk'
import { LockDurationSlider } from '@repo/lib/modules/vebal/lock/duration/LockDurationSlider'
import { VebalLockDetailsAccordion } from '@repo/lib/modules/vebal/lock/VebalLockDetailsAccordion'
import { VebalLockDetails } from '@repo/lib/modules/vebal/lock/VebalLockDetails'
import { LockMode, useVebalLock } from '@repo/lib/modules/vebal/lock/VebalLockProvider'
import { fNum, isZero } from '@repo/lib/shared/utils/numbers'
import { VebalLockModal } from '@repo/lib/modules/vebal/lock/modal/VebalLockModal'
import { useRouter } from 'next/navigation'
import { useVebalLockData } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { getModalLabel } from '@repo/lib/modules/vebal/lock/steps/lock-steps.utils'
import { useState } from 'react'
import { ClickableText } from '@repo/lib/shared/components/typography/ClickableText'
import { Address } from 'viem'
import { TokenRowWithDetails } from '@repo/lib/modules/tokens/TokenRow/TokenRowWithDetails'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertLink } from '@repo/lib/shared/components/alerts/BalAlertLink'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'

type Props = {
  allowEditOnInit?: boolean
}

export function VebalLockForm({ allowEditOnInit = false }: Props) {
  const { refetchAll } = useVebalLockData()
  const {
    vebalBptToken,
    lpToken,
    setLpToken,
    resetLpToken,
    lockedAmount,
    totalAmount,
    isDisabled,
    disabledReason,
    previewModalDisclosure,
    lockDuration,
    isLoading,
    lockMode,
    expectedVeBalAmount,
  } = useVebalLock()

  const router = useRouter()

  const { balanceFor } = useTokenBalances()
  const bptBalance = balanceFor(vebalBptToken.address)

  function onModalClose(isSuccess: boolean) {
    previewModalDisclosure.onClose()
    refetchAll()
    if (isSuccess) {
      router.push('/vebal/manage')
    }
  }

  const [isEditingAmount, setIsEditingAmount] = useState(allowEditOnInit)

  const onEditAmountToggle = (value: boolean) => {
    setIsEditingAmount(value)
    if (!value) {
      resetLpToken()
    }
  }

  const unlockingMode = LockMode.Unlock === lockMode

  const amountMode: 'edit' | 'show' = unlockingMode ? 'show' : isEditingAmount ? 'edit' : 'show'

  return (
    <Box maxW="lg" mx="auto" pb="2xl" w="full">
      <Card>
        <CardHeader>
          <HStack justify="space-between" w="full">
            <span>{getModalLabel(lockMode, true)}</span>
          </HStack>
        </CardHeader>
        <VStack align="start" spacing="lg" w="full">
          {bptBalance !== undefined && isZero(bptBalance.amount) && isZero(totalAmount) && (
            <BalAlert
              content={
                <Text color="font.dark">
                  {`You need to lock the LP token of the ve8020 BAL/WETH pool to get veBAL. Since you
                    don't have this, you can't get veBAL.`}
                  <br />
                  Add liquidity to this pool to get the LP token and came back: <br />
                  <BalAlertLink href="/pools/ethereum/v2/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014">
                    80% BAL / 20% WETH pool
                  </BalAlertLink>
                </Text>
              }
              status="info"
            />
          )}

          <VStack align="start" spacing="sm" w="full">
            <HStack justifyContent="space-between" w="full">
              {isLoading ? (
                <Skeleton h="18px" w="100px" />
              ) : (
                <Text fontSize="sm" fontWeight="700" lineHeight="18px">
                  {amountMode === 'show' ? 'Locked amount' : 'Amount to lock'}
                </Text>
              )}

              {!isLoading && !unlockingMode && (
                <ClickableText
                  fontSize="sm"
                  fontWeight="700"
                  lineHeight="18px"
                  onClick={() => onEditAmountToggle(!isEditingAmount)}
                >
                  {amountMode === 'show' ? 'Edit amount' : 'Cancel'}
                </ClickableText>
              )}
            </HStack>

            {amountMode === 'edit' && (
              <TokenInput
                address={vebalBptToken.address}
                chain={vebalBptToken.chain}
                onChange={e => setLpToken(e.currentTarget.value as HumanAmount)}
                value={lpToken || ''}
              />
            )}

            {amountMode === 'show' && (
              <Card variant="level2">
                <TokenRowWithDetails
                  address={vebalBptToken.address as Address}
                  chain={vebalBptToken.chain}
                  details={
                    lockMode === LockMode.Unlock && lockDuration.lockedUntilDateFormatted
                      ? [
                          [
                            <Text fontSize="sm" key={1} variant="secondary">
                              Lock-up period ended
                            </Text>,
                            <Text fontSize="sm" key={2} variant="secondary">
                              {lockDuration.lockedUntilDateFormatted}
                            </Text>,
                          ],
                        ]
                      : undefined
                  }
                  value={lockedAmount ?? ''}
                />
              </Card>
            )}
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
              {/* TO-DO (vebal) Potential min. weekly yield */}
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
