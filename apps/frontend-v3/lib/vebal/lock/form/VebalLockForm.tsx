'use client'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
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
import { LockDurationSlider } from '@bal/lib/vebal/lock/duration/LockDurationSlider'
import { VebalLockDetailsAccordion } from '@bal/lib/vebal/lock/VebalLockDetailsAccordion'
import { VebalLockDetails } from '@bal/lib/vebal/lock/VebalLockDetails'
import { expectedTotalVeBal, LockMode, useVebalLock } from '@bal/lib/vebal/lock/VebalLockProvider'
import { fNum, isZero } from '@repo/lib/shared/utils/numbers'
import { VebalLockModal } from '@bal/lib/vebal/lock/modal/VebalLockModal'
import { useRouter } from 'next/navigation'
import { getModalLabel } from '@bal/lib/vebal/lock/steps/lock-steps.utils'
import { useState } from 'react'
import { ClickableText } from '@repo/lib/shared/components/typography/ClickableText'
import { Address } from 'viem'
import { TokenRowWithDetails } from '@repo/lib/modules/tokens/TokenRow/TokenRowWithDetails'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertLink } from '@repo/lib/shared/components/alerts/BalAlertLink'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { WeeklyYieldTooltip } from './WeeklyYieldTooltip'
import { useGetPoolRewards } from '@repo/lib/modules/pool/useGetPoolRewards'
import { useVeBALPool } from '../../vote/Votes/MyVotes/MyVotesStats/useVeBALPool'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlPoolAprItem } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useVebalLockData } from '@repo/lib/modules/vebal/VebalLockDataProvider'
import { ArrowRight } from 'react-feather'

type Props = {
  editAlwaysOn?: boolean
}

export function VebalLockForm({ editAlwaysOn = false }: Props) {
  const { refetchAll } = useVebalLockData()
  const {
    vebalBptToken,
    lpToken,
    setLpToken,
    resetLpToken,
    previousLockEnd,
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

  function onModalClose(isSuccess: boolean, redirectPath: string) {
    previewModalDisclosure.onClose()
    refetchAll()
    if (isSuccess) {
      router.push(redirectPath)
    }
  }

  const [isEditingAmount, setIsEditingAmount] = useState(editAlwaysOn)

  const onEditAmountToggle = (value: boolean) => {
    setIsEditingAmount(value)
    if (!value) {
      resetLpToken()
    }
  }

  const unlockingMode = LockMode.Unlock === lockMode

  const amountMode: 'edit' | 'show' = unlockingMode ? 'show' : isEditingAmount ? 'edit' : 'show'

  const { userAddress } = useUserAccount()
  const { pool, poolIsLoading } = useVeBALPool(userAddress)
  const { calculatePotentialYield } = useGetPoolRewards(pool || ({} as Pool))
  const { usdValueForToken } = useTokens()
  const totalUsdValue = usdValueForToken(vebalBptToken, expectedVeBalAmount.totalExpectedVeBal)
  const weeklyYield = !poolIsLoading ? calculatePotentialYield(totalUsdValue) : '0'

  const hasLockedAmount = lockedAmount && Number(lockedAmount) > 0
  const currentVeBALAmount = previousLockEnd
    ? expectedTotalVeBal({ bpt: lockedAmount || '0', lockEndDate: previousLockEnd })
    : bn(0)
  const currentTotalUsdValue = usdValueForToken(vebalBptToken, currentVeBALAmount || 0)
  const currentWeeklyYield = !poolIsLoading ? calculatePotentialYield(currentTotalUsdValue) : '0'

  return (
    <Box maxW="lg" mx="auto" pb="2xl" w="full">
      <Card>
        <CardHeader>
          <HStack justify="space-between" w="full">
            <span>{getModalLabel(lockMode, editAlwaysOn, true)}</span>
          </HStack>
        </CardHeader>
        <VStack align="start" spacing="lg" w="full">
          {bptBalance !== undefined && isZero(bptBalance.amount) && isZero(totalAmount) && (
            <BalAlert
              content={
                <Text color="font.dark" fontSize="sm">
                  {`You need to lock the LP token of the `}
                  <BalAlertLink
                    fontSize="sm"
                    href="/pools/ethereum/v2/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014"
                  >
                    80% BAL / 20% WETH pool
                  </BalAlertLink>
                  {` to get veBAL. This is the special Balancer protocol liquidity pool. Come back to this step once you have acquired some of these LP tokens by adding liquidity to the `}
                  <BalAlertLink
                    fontSize="sm"
                    href="/pools/ethereum/v2/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014"
                  >
                    pool
                  </BalAlertLink>
                  .
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
                  {amountMode === 'show'
                    ? 'Locked amount'
                    : hasLockedAmount
                      ? 'Amount to add to your existing lock'
                      : 'Amount to lock'}
                </Text>
              )}

              {!isLoading && !unlockingMode && !editAlwaysOn && (
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
              <TooltipWithTouch label="The minimum lock period is to the Thursday of the following week. The maximum lock period is to the closest Thursday to the end of a 1 year period. Once locked, you cannot redeem your LP tokens until lock expiry. You can extend your lock period later at any time.">
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  lineHeight="18px"
                  sx={{
                    textDecoration: 'underline dotted',
                    textUnderlineOffset: '4px',
                    textUnderlineThickness: '0.5px',
                    cursor: 'pointer',
                  }}
                >
                  Lock duration
                </Text>
              </TooltipWithTouch>
              <Box textAlign="right" w="100px">
                <Tooltip label={lockDuration.lockUntilDateFormatted}>
                  <Text fontSize="sm" fontWeight="700" lineHeight="18px">
                    {lockDuration.lockUntilDateDuration}
                  </Text>
                </Tooltip>
              </Box>
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
                  <HStack>
                    <Text color="font.secondary" fontSize="md" fontWeight="700" lineHeight="16px">
                      {`${fNum('token', currentVeBALAmount)}`}
                    </Text>
                    <Text color="font.secondary" fontSize="md" fontWeight="700" lineHeight="16px">
                      <ArrowRight size={14} />
                    </Text>
                    <Text fontSize="md" fontWeight="700" lineHeight="16px">
                      {fNum('token', expectedVeBalAmount.totalExpectedVeBal)}
                    </Text>
                  </HStack>
                </VStack>
              </Card>
            </GridItem>
            <GridItem>
              {poolIsLoading ? (
                <Skeleton h="18px" w="100px" />
              ) : (
                <WeeklyYieldTooltip
                  aprItems={pool?.dynamicData.aprItems as GqlPoolAprItem[]}
                  currentWeeklyYield={currentWeeklyYield}
                  pool={pool as Pool}
                  totalUsdValue={totalUsdValue.toString()}
                  weeklyYield={weeklyYield}
                />
              )}
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
