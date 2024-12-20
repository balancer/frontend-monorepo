import { getNativeAssetAddress, getNetworkConfig } from '@repo/lib/config/app.config'
import { BPT_DECIMALS } from '@repo/lib/modules/pool/pool.constants'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { bn } from '@repo/lib/shared/utils/numbers'
import { HumanAmount } from '@balancer/sdk'
import {
  Address,
  Log,
  erc20Abi,
  formatUnits,
  parseAbiItem,
  parseEventLogs,
  zeroAddress,
} from 'viem'
import { HumanTokenAmount } from '../../../tokens/token.types'
import { emptyAddress } from '../../../web3/contracts/wagmi-helpers'
import { ApiToken, ProtocolVersion } from '@repo/lib/modules/pool/pool.types'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

type ParseProps = {
  receiptLogs: Log[]
  chain: GqlChain
  userAddress?: Address
  txValue: bigint
  getToken: (address: Address, chain: GqlChain) => ApiToken | undefined
  protocolVersion: ProtocolVersion
}

export type ParseReceipt =
  | typeof parseAddLiquidityReceipt
  | typeof parseRemoveLiquidityReceipt
  | typeof parseSwapReceipt
  | typeof parseLstStakeReceipt
  | typeof parseLstUnstakeReceipt
  | typeof parseLstWithdrawReceipt

export function parseAddLiquidityReceipt({
  chain,
  receiptLogs,
  userAddress,
  txValue,
  getToken,
}: ParseProps) {
  const nativeAssetSent = txValue || 0n

  const sentErc20Tokens: HumanTokenAmount[] = getOutgoingLogs(receiptLogs, userAddress).map(log => {
    const tokenDecimals = getToken(log.address, chain)?.decimals
    return _toHumanAmount(log.address, log.args.value, tokenDecimals)
  })

  const sentTokens = bn(nativeAssetSent).gt(0)
    ? [...sentErc20Tokens, _toHumanAmount(getNativeAssetAddress(chain), nativeAssetSent, 18)]
    : sentErc20Tokens

  const receivedBptAmount = getIncomingLogs(receiptLogs, userAddress)?.[0]?.args?.value
  const receivedBptUnits = formatUnits(receivedBptAmount || 0n, BPT_DECIMALS)

  // ERC-20: Monerium EURe (EURe)
  const erc20EURe = '0x420ca0f9b9b604ce0fd9c18ef134c705e5fa3430'

  return {
    /*
      TODO:
        properly implement this filter getting this info from LiquidityAdded/Removed event instead of Transfers
        They use frontend (erc20) <> controller (upgradable proxy) setup - where calls to erc20 are forwarded to the controller.
        Both emit events, which explains the duplicates.
    */
    sentTokens: sentTokens.filter(t => !isSameAddress(t.tokenAddress, erc20EURe)),
    receivedBptUnits,
  }
}

export function parseRemoveLiquidityReceipt({
  receiptLogs,
  userAddress,
  chain,
  getToken,
  protocolVersion,
}: ParseProps) {
  const nativeAssetReceived =
    (getIncomingWithdrawals(receiptLogs, chain, protocolVersion, userAddress) as bigint) || 0n

  const receivedErc20Tokens: HumanTokenAmount[] = getIncomingLogs(receiptLogs, userAddress).map(
    log => {
      const tokenDecimals = getToken(log.address, chain)?.decimals
      return _toHumanAmount(log.address, log.args.value, tokenDecimals)
    }
  )

  const receivedTokens = bn(nativeAssetReceived).gt(0)
    ? [
        ...receivedErc20Tokens,
        _toHumanAmount(getNativeAssetAddress(chain), nativeAssetReceived, 18),
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
  protocolVersion,
}: ParseProps) {
  /**
   * GET SENT AMOUNT
   */
  const nativeAssetSent = txValue

  const outgoingData = getOutgoingLogs(receiptLogs, userAddress)[0]
  const sentTokenValue = outgoingData?.args?.value || 0n
  const sentTokenAddress = outgoingData?.address
  const sentToken = sentTokenAddress ? getToken(sentTokenAddress, chain) : undefined

  const sentHumanAmountWithAddress: HumanTokenAmount =
    bn(sentTokenValue).gt(0) && sentTokenAddress
      ? _toHumanAmount(sentTokenAddress, outgoingData?.args?.value, sentToken?.decimals)
      : bn(nativeAssetSent).gt(0)
        ? _toHumanAmount(getNativeAssetAddress(chain), nativeAssetSent, 18)
        : { tokenAddress: emptyAddress, humanAmount: '0' as HumanAmount }

  /**
   * GET RECEIVED AMOUNT
   */
  const nativeAssetReceived =
    (getIncomingWithdrawals(receiptLogs, chain, protocolVersion, userAddress) as bigint) || 0n

  const incomingData = getIncomingLogs(receiptLogs, userAddress)[0]
  const receivedTokenValue = incomingData?.args?.value || 0n
  const receivedTokenAddress = incomingData?.address
  const receivedToken = receivedTokenAddress ? getToken(receivedTokenAddress, chain) : undefined

  const receivedHumanAmountWithAddress =
    bn(receivedTokenValue).gt(0) && receivedTokenAddress
      ? _toHumanAmount(receivedTokenAddress, receivedTokenValue, receivedToken?.decimals)
      : bn(nativeAssetReceived).gt(0)
        ? _toHumanAmount(getNativeAssetAddress(chain), nativeAssetReceived, 18)
        : { tokenAddress: emptyAddress, humanAmount: '0' as HumanAmount }

  return {
    sentToken: sentHumanAmountWithAddress,
    receivedToken: receivedHumanAmountWithAddress,
  }
}

export function parseLstStakeReceipt({ receiptLogs, userAddress, chain, getToken }: ParseProps) {
  const receivedToken: HumanTokenAmount[] = getIncomingLogs(receiptLogs, userAddress).map(log => {
    const tokenDecimals = getToken(log.address, chain)?.decimals
    return _toHumanAmount(log.address, log.args.value, tokenDecimals)
  })

  return {
    receivedToken,
  }
}

export function parseLstUnstakeReceipt({ receiptLogs, userAddress, chain, getToken }: ParseProps) {
  const receivedToken: HumanTokenAmount[] = getIncomingLogs(receiptLogs, userAddress).map(log => {
    const tokenDecimals = getToken(log.address, chain)?.decimals
    return _toHumanAmount(log.address, log.args.value, tokenDecimals)
  })

  return {
    receivedToken,
  }
}

export function parseLstWithdrawReceipt({ receiptLogs, userAddress, chain, getToken }: ParseProps) {
  const receivedToken: HumanTokenAmount[] = getIncomingLogs(receiptLogs, userAddress).map(log => {
    const tokenDecimals = getToken(log.address, chain)?.decimals
    return _toHumanAmount(log.address, log.args.value, tokenDecimals)
  })

  return {
    receivedToken,
  }
}

/*
  rawValue and tokenDecimals should always be valid so we use default values to avoid complex error handling
*/
function _toHumanAmount(
  tokenAddress: Address,
  rawValue = 0n,
  tokenDecimals = BPT_DECIMALS
): HumanTokenAmount {
  const humanAmount = formatUnits(rawValue, tokenDecimals)
  return { tokenAddress: tokenAddress, humanAmount: humanAmount }
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

function getIncomingWithdrawals(
  logs: Log[],
  chain: GqlChain,
  protocolVersion: ProtocolVersion,
  userAddress?: Address
) {
  if (!userAddress) return []
  const networkConfig = getNetworkConfig(chain)

  const from =
    protocolVersion === 3
      ? networkConfig.contracts.balancer.batchRouter
      : networkConfig.contracts.balancer.vaultV2

  // Fantom uses the Transfer event instead of Withdrawal
  if (chain === GqlChain.Fantom) {
    return parseEventLogs({
      abi: [
        parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      ],
      args: { from: from, to: zeroAddress },
      logs: logs,
    })[0]?.args?.value
  } else {
    // Catches when the wNativeAsset is withdrawn from the vault, assumption is
    // that his means the user is getting the same value in the native asset.
    return parseEventLogs({
      abi: [parseAbiItem('event Withdrawal(address indexed src, uint256 wad)')],
      args: { src: from },
      logs: logs,
    })[0]?.args?.wad
  }
}
