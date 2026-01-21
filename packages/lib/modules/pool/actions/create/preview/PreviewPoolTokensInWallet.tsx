import { CardBody, VStack, Text, Divider, HStack, Box, Icon } from '@chakra-ui/react'
import { CardHeaderRow, CardDataRow, IdentifyTokenCell, DefaultDataRow } from './PreviewCardRows'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { PreviewPoolCreationCard } from './PreviewPoolCreationCard'
import { TokenMissingPriceWarning } from '@repo/lib/modules/tokens/TokenMissingPriceWarning'
import { usePoolTokenPriceWarnings } from '@repo/lib/modules/pool/usePoolTokenPriceWarnings'
import { AlertTriangle } from 'react-feather'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
import { usePoolTokensInWallet, SelectedPoolToken } from './usePoolTokensInWallet'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'

export function PreviewPoolTokensInWallet() {
  const { selectedPoolTokens, hasNoTokensWithBalance } = usePoolTokensInWallet()
  const { isConnected } = useUserAccount()

  const hasAtLeastOneZeroBalanceToken = selectedPoolTokens.some(token => token.hasZeroBalance)
  const hasMultipleTokensSelected = selectedPoolTokens.length >= 2
  const shouldShowError = hasMultipleTokensSelected && isConnected && hasAtLeastOneZeroBalanceToken

  return (
    <PreviewPoolCreationCard
      hasWarning={shouldShowError}
      isConnected={isConnected}
      stepTitle="Tokens"
    >
      <CardHeaderRow columnNames={['Pool tokens in my wallet', 'Token value', '%']} />
      <CardBody>
        <VStack spacing="md">
          <PoolTokensInWalletContent
            hasNoTokensWithBalance={hasNoTokensWithBalance}
            selectedPoolTokens={selectedPoolTokens}
          />
        </VStack>
      </CardBody>
    </PreviewPoolCreationCard>
  )
}

function ZeroBalanceWarning({ isConnected }: { isConnected: boolean }) {
  if (!isConnected) {
    return (
      <HStack color="font.disabled" justify="end" spacing="xs">
        <Text color="font.disabled">–</Text>
      </HStack>
    )
  }

  return (
    <TooltipWithTouch label="Your wallet has none of this token." placement="top">
      <HStack color="font.warning" justify="end" spacing="xs">
        <Text color="font.warning">$0.00</Text>
        <Box>
          <Icon as={AlertTriangle} boxSize="16px" />
        </Box>
      </HStack>
    </TooltipWithTouch>
  )
}

function PoolTokensInWalletContent({
  hasNoTokensWithBalance,
  selectedPoolTokens,
}: {
  hasNoTokensWithBalance: boolean
  selectedPoolTokens: SelectedPoolToken[]
}) {
  const { toCurrency } = useCurrency()
  const { tokenPriceTip, tokenWeightTip } = usePoolTokenPriceWarnings()
  const { isConnected } = useUserAccount()

  const hasSelectedTokens = selectedPoolTokens.length > 0
  if (!hasSelectedTokens) return <DefaultCardContent />

  const tokensWithBalance = selectedPoolTokens.filter(token => !token.hasZeroBalance)
  const totalLiquidityUsd = tokensWithBalance.reduce((acc, token) => {
    return acc + Number(token.userBalanceUsd || 0)
  }, 0)

  const hasMultipleTokensSelected = selectedPoolTokens.length >= 2
  const hasAtLeastOneZeroBalanceToken = selectedPoolTokens.some(token => token.hasZeroBalance)

  return (
    <>
      {hasMultipleTokensSelected && isConnected && hasAtLeastOneZeroBalanceToken && (
        <BalAlert
          content="You can continue to configure settings, and even create the pool but unseeded pools will not appear on the Balancer UI. So you'll need to get each token to seed the pool with the best ratio to set the initial price. "
          status="warning"
          title={
            hasNoTokensWithBalance
              ? "You don't have any of these tokens in your wallet."
              : "You don't have all of the pool tokens in your wallet"
          }
        />
      )}
      {selectedPoolTokens.map(token => (
        <CardDataRow
          data={[
            <IdentifyTokenCell address={token.address} chain={token.chain} symbol={token.symbol} />,
            token.hasZeroBalance ? (
              <ZeroBalanceWarning isConnected={isConnected} />
            ) : (
              <HStack justify="end">
                {token.userBalanceUsd !== '0' ? (
                  <Text>{toCurrency(token.userBalanceUsd)}</Text>
                ) : (
                  <TokenMissingPriceWarning message={tokenPriceTip} />
                )}
              </HStack>
            ),
            token.hasZeroBalance ? (
              <Text align="right" color={isConnected ? 'font.warning' : 'font.disabled'}>
                {isConnected ? '0.00%' : '–'}
              </Text>
            ) : (
              <HStack justify="end">
                {token.userBalanceUsd !== '0' && totalLiquidityUsd > 0 ? (
                  <Text>
                    {((Number(token.userBalanceUsd) / totalLiquidityUsd) * 100).toFixed(2) + '%'}
                  </Text>
                ) : (
                  <TokenMissingPriceWarning message={tokenWeightTip} />
                )}
              </HStack>
            ),
          ]}
          key={token.address}
        />
      ))}
      {tokensWithBalance.length > 0 && (
        <>
          <Divider />
          <CardDataRow
            data={[
              <Text fontWeight="semibold">Total potential seed liquidity</Text>,
              <Text align="right">{toCurrency(totalLiquidityUsd)}</Text>,
              <Text align="right">100%</Text>,
            ]}
          />
        </>
      )}
    </>
  )
}

function DefaultCardContent() {
  return (
    <>
      <DefaultDataRow />
      <DefaultDataRow />
    </>
  )
}
