import { getNativeAssetAddress, getNetworkConfig } from '@/lib/config/app.config'
import { BPT_DECIMALS } from '@/lib/modules/pool/pool.constants'
import { GqlChain, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { bn } from '@/lib/shared/utils/numbers'
import { HumanAmount } from '@balancer/sdk'
import { Address, Log, erc20Abi, formatUnits, parseAbiItem, parseEventLogs } from 'viem'
import { HumanTokenAmountWithAddress } from '../../../tokens/token.types'
import { emptyAddress } from '../../../web3/contracts/wagmi-helpers'

type ParseProps = {
  receiptLogs: Log[]
  chain: GqlChain
  userAddress?: Address
  txValue: bigint
  getToken: (address: Address, chain: GqlChain) => GqlToken | undefined
}

export type ParseReceipt =
  | typeof parseAddLiquidityReceipt
  | typeof parseRemoveLiquidityReceipt
  | typeof parseSwapReceipt

export function parseAddLiquidityReceipt({
  chain,
  receiptLogs,
  userAddress,
  txValue,
  getToken,
}: ParseProps) {
  const nativeAssetSent = txValue || 0n

  const sentErc20Tokens: HumanTokenAmountWithAddress[] = getOutgoingLogs(
    receiptLogs,
    userAddress
  ).map(log => {
    const tokenDecimals = getToken(log.address, chain)?.decimals
    return _toHumanAmountWithAddress(log.address, log.args.value, tokenDecimals)
  })

  const sentTokens = bn(nativeAssetSent).gt(0)
    ? [
        ...sentErc20Tokens,
        _toHumanAmountWithAddress(getNativeAssetAddress(chain), nativeAssetSent, 18),
      ]
    : sentErc20Tokens

  const receivedBptAmount = getIncomingLogs(receiptLogs, userAddress)?.[0]?.args?.value
  const receivedBptUnits = formatUnits(receivedBptAmount || 0n, BPT_DECIMALS)

  return {
    sentTokens,
    receivedBptUnits,
  }
}

export function parseRemoveLiquidityReceipt({
  receiptLogs,
  userAddress,
  chain,
  getToken,
}: ParseProps) {
  const nativeAssetReceived =
    getIncomingWithdrawals(receiptLogs, chain, userAddress)?.[0]?.args?.wad || 0n

  const receivedErc20Tokens: HumanTokenAmountWithAddress[] = getIncomingLogs(
    receiptLogs,
    userAddress
  ).map(log => {
    const tokenDecimals = getToken(log.address, chain)?.decimals
    return _toHumanAmountWithAddress(log.address, log.args.value, tokenDecimals)
  })

  const receivedTokens = bn(nativeAssetReceived).gt(0)
    ? [
        ...receivedErc20Tokens,
        _toHumanAmountWithAddress(getNativeAssetAddress(chain), nativeAssetReceived, 18),
      ]
    : receivedErc20Tokens

  const sentBptAmount = getOutgoingLogs(receiptLogs, userAddress)?.[0]?.args?.value
  const sentBptUnits = formatUnits(sentBptAmount || 0n, BPT_DECIMALS)

  return {
    receivedTokens,
    sentBptUnits,
  }
}

export function parseSwapReceipt({
  receiptLogs,
  userAddress,
  chain,
  getToken,
  txValue,
}: ParseProps) {
  /**
   * GET SENT AMOUNT
   */
  const nativeAssetSent = txValue

  const outgoingData = getOutgoingLogs(receiptLogs, userAddress)[0]
  const sentTokenValue = outgoingData?.args?.value || 0n
  const sentTokenAddress = outgoingData?.address
  const sentToken = sentTokenAddress ? getToken(sentTokenAddress, chain) : undefined

  const sentHumanAmountWithAddress: HumanTokenAmountWithAddress =
    bn(sentTokenValue).gt(0) && sentTokenAddress
      ? _toHumanAmountWithAddress(sentTokenAddress, outgoingData?.args?.value, sentToken?.decimals)
      : bn(nativeAssetSent).gt(0)
      ? _toHumanAmountWithAddress(getNativeAssetAddress(chain), nativeAssetSent, 18)
      : { tokenAddress: emptyAddress, humanAmount: '0' as HumanAmount }

  /**
   * GET RECEIVED AMOUNT
   */
  const nativeAssetReceived =
    getIncomingWithdrawals(receiptLogs, chain, userAddress)[0]?.args?.wad || 0n

  const incomingData = getIncomingLogs(receiptLogs, userAddress)[0]
  const receivedTokenValue = incomingData?.args?.value || 0n
  const receivedTokenAddress = incomingData?.address
  const receivedToken = receivedTokenAddress ? getToken(receivedTokenAddress, chain) : undefined

  const receivedHumanAmountWithAddress =
    bn(receivedTokenValue).gt(0) && receivedTokenAddress
      ? _toHumanAmountWithAddress(receivedTokenAddress, receivedTokenValue, receivedToken?.decimals)
      : bn(nativeAssetReceived).gt(0)
      ? _toHumanAmountWithAddress(getNativeAssetAddress(chain), nativeAssetReceived, 18)
      : { tokenAddress: emptyAddress, humanAmount: '0' as HumanAmount }

  return {
    sentToken: sentHumanAmountWithAddress,
    receivedToken: receivedHumanAmountWithAddress,
  }
}

/*
  rawValue and tokenDecimals should always be valid so we use default values to avoid complex error handling
*/
function _toHumanAmountWithAddress(tokenAddress: Address, rawValue = 0n, tokenDecimals = 18) {
  const humanAmount = formatUnits(rawValue, tokenDecimals)
  return { tokenAddress: tokenAddress, humanAmount: humanAmount } as HumanTokenAmountWithAddress
}

function getOutgoingLogs(logs: Log[], userAddress?: Address) {
  if (!userAddress) return []
  return parseEventLogs({
    abi: erc20Abi,
    logs: logs,
    eventName: 'Transfer',
    args: {
      from: userAddress,
    },
  })
}

function getIncomingLogs(logs: Log[], userAddress?: Address) {
  if (!userAddress) return []
  return parseEventLogs({
    abi: erc20Abi,
    logs: logs,
    eventName: 'Transfer',
    args: {
      to: userAddress,
    },
  })
}

// TODO V3 - This works for v2 vault but may not work for v3
function getIncomingWithdrawals(logs: Log[], chain: GqlChain, userAddress?: Address) {
  if (!userAddress) return []
  const networkConfig = getNetworkConfig(chain)
  // Catches when the wNativeAsset is withdrawn from the vault, assumption is
  // that his means the user is getting the same value in the native asset.
  return parseEventLogs({
    abi: [parseAbiItem('event Withdrawal(address indexed src, uint256 wad)')],
    args: { src: networkConfig.contracts.balancer.vaultV2 },
    logs: logs,
  })
}
