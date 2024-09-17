import { GqlPoolElement } from '@/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@/lib/shared/utils/addresses'
import {
  VAULT,
  ChainId,
  HumanAmount,
  MAX_UINT256,
  Token,
  ZERO_ADDRESS,
  replaceWrapped,
} from '@balancer/sdk'
import {
  Address,
  Client,
  Hex,
  PublicActions,
  TestActions,
  TransactionReceipt,
  WalletActions,
  concat,
  encodeAbiParameters,
  hexToBigInt,
  keccak256,
  pad,
  parseUnits,
  toBytes,
  toHex,
  trim,
} from 'viem'
import { erc20Abi } from 'viem'
import { aWjAuraWethPoolElementMock } from '../msw/builders/gqlPoolElement.builders'
import { defaultTestUserAccount } from '../anvil/anvil-setup'
import { mainnet } from 'viem/chains'
import { mainnetTestPublicClient } from '../utils/wagmi/wagmi-test-clients'

/*
  Given chain, user account and pool
  Returns a set of helper functions to:
  - Prepare the anvil state where the integration tests are running (i.e. set balances of tokens in the pool)
  - Check the new state of the pool after the test updates (i.e check the balances of the tokens in the pool)
*/
export async function getSdkTestUtils({
  client = mainnetTestPublicClient,
  chainId = ChainId.MAINNET,
  account = defaultTestUserAccount,
  pool = aWjAuraWethPoolElementMock(),
}: {
  client?: Client & PublicActions & WalletActions & TestActions
  account?: Address
  chainId?: ChainId
  pool: GqlPoolElement
}) {
  return {
    approveToken,
    getPoolTokenBalances,
    getPoolTokens,
    calculateBalanceDeltas,
    setupToken,
    setupTokens,
    setUserPoolBalance,
  }

  async function approveToken(
    account: Address,
    token: Address,
    amount = MAX_UINT256 // approve max by default
  ): Promise<boolean> {
    // approve token on the vault
    const hash = await client.writeContract({
      account,
      chain: client.chain,
      address: token,
      abi: erc20Abi,
      functionName: 'approve',
      args: [VAULT[client?.chain?.id || mainnet.id], amount],
    })

    const txReceipt = await client.waitForTransactionReceipt({
      hash,
    })
    return txReceipt.status === 'success'
  }

  function getErc20Balance(token: Address, holder: Address): Promise<bigint> {
    return client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [holder],
    })
  }

  async function getPoolTokenBalances(
    tokens = getTokensForBalanceCheck(true)
  ): Promise<Promise<bigint[]>> {
    const balances: Promise<bigint>[] = []
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === ZERO_ADDRESS) {
        balances[i] = client.getBalance({
          address: account,
        })
      } else {
        balances[i] = getErc20Balance(tokens[i] as Address, account)
      }
    }
    return Promise.all(balances)
  }

  function getPoolTokens() {
    return pool.poolTokens.map(t => new Token(chainId, t.address as Address, t.decimals))
  }

  // Token addresses to check balance deltas
  // Includes BPT token address
  function getTokensForBalanceCheck(checkNativeBalance = true) {
    const poolTokens = getPoolTokens()
    // Replace with native asset if required
    const poolTokensAddr = checkNativeBalance
      ? replaceWrapped(poolTokens, chainId).map(t => t.address)
      : poolTokens.map(t => t.address)
    return [...poolTokensAddr, pool.address]
  }

  // // Includes BPT balance
  // async function getAllBalances() {
  //   return await getBalances([...getTokensForBalanceCheck(true), poolStateInput.address])
  // }

  async function calculateBalanceDeltas(
    balanceBefore: bigint[],
    transactionReceipt: TransactionReceipt
  ) {
    const { gasUsed, effectiveGasPrice } = transactionReceipt
    const gasPrice = gasUsed * effectiveGasPrice

    const balancesAfter = await getPoolTokenBalances()

    const tokensForBalanceCheck = getTokensForBalanceCheck(true)

    const balanceDeltas = balancesAfter.map((balanceAfter, i) => {
      let _balanceAfter = balanceAfter
      if (tokensForBalanceCheck[i] === ZERO_ADDRESS) {
        // ignore ETH delta from gas cost
        _balanceAfter = balanceAfter + gasPrice
      }
      const delta = _balanceAfter - balanceBefore[i]
      return delta >= 0n ? delta : -delta
    })

    return balanceDeltas
  }

  /**
   * Set local ERC20 token balance for a given account address (used for testing)
   *
   * @param client client that will perform the setStorageAt call
   * @param accountAddress Account address that will have token balance set
   * @param token Token address which balance will be set
   * @param slot Slot memory that stores balance - use npm package `slot20` to identify which slot to provide
   * @param balance Balance in EVM amount
   * @param isVyperMapping Whether the storage uses Vyper or Solidity mapping
   */
  async function setTokenBalance(
    token: Address,
    slot: number,
    balance: bigint,
    isVyperMapping = false
  ): Promise<void> {
    // Get storage slot index

    const slotBytes = pad(toBytes(slot))
    const accountAddressBytes = pad(toBytes(account))

    let index: Address
    if (isVyperMapping) {
      index = keccak256(concat([slotBytes, accountAddressBytes])) // slot, key
    } else {
      index = keccak256(concat([accountAddressBytes, slotBytes])) // key, slot
    }

    // Manipulate local balance (needs to be bytes32 string)
    await client.setStorageAt({
      address: token,
      index,
      value: toHex(balance, { size: 32 }),
    })
  }

  /**
   * Find ERC20 token balance storage slot (to be used on setTokenBalance)
   *
   * @param client client that will perform contract calls
   * @param accountAddress Account address to probe storage slot changes
   * @param tokenAddress Token address which we're looking for the balance slot
   * @param isVyperMapping Whether the storage uses Vyper or Solidity mapping
   */
  async function findTokenBalanceSlot(
    accountAddress: Address,
    tokenAddress: Address,
    isVyperMapping = false
  ): Promise<number> {
    const probeA = encodeAbiParameters(
      [{ name: 'probeA', type: 'uint256' }],
      [BigInt((Math.random() * 10000).toFixed())]
    )
    const probeB = encodeAbiParameters(
      [{ name: 'probeA', type: 'uint256' }],
      [BigInt((Math.random() * 10000).toFixed())]
    )
    for (let i = 0; i < 999; i++) {
      // encode probed slot
      const slotBytes = pad(toBytes(i))
      const accountAddressBytes = pad(toBytes(accountAddress))
      let probedSlot: Address
      if (isVyperMapping) {
        probedSlot = keccak256(concat([slotBytes, accountAddressBytes])) // slot, key
      } else {
        probedSlot = keccak256(concat([accountAddressBytes, slotBytes])) // key, slot
      }

      // remove padding for JSON RPC
      probedSlot = trim(probedSlot)

      // get storage value
      const prev = (await client.getStorageAt({
        address: tokenAddress,
        slot: probedSlot,
      })) as Hex

      // set storage slot to new probe
      const probe = prev === probeA ? probeB : probeA
      await client.setStorageAt({
        address: tokenAddress,
        index: probedSlot,
        value: probe,
      })

      // check if balance changed
      const balance = await getErc20Balance(tokenAddress, account)

      // reset to previous value
      await client.setStorageAt({
        address: tokenAddress,
        index: probedSlot,
        value: prev,
      })

      // return slot if balance changed
      if (balance === hexToBigInt(probe)) return i
    }
    throw new Error('Balance slot not found!')
  }

  /**
   * Setup local fork with approved token balance for a given account address
   *
   * @param client Client that will perform transactions
   * @param accountAddress Account address that will have token balance set and approved
   * @param tokens Token addresses which balance will be set and approved
   * @param slots Slot that stores token balance in memory - use npm package `slot20` to identify which slot to provide
   * @param balances Balances in EVM amounts
   * @param jsonRpcUrl Url with remote node to be forked locally
   * @param blockNumber Number of the block that the fork will happen
   * @param isVyperMapping Whether the storage uses Vyper or Solidity mapping
   */
  async function setupTokens(
    humanBalances: HumanAmount[],
    isVyperMapping: boolean[] = Array(getPoolTokens().length).fill(false),
    slots?: number[]
  ): Promise<void> {
    // await client.impersonateAccount({ address: account })

    const tokens = getPoolTokens().map(token => token.address)

    let _slots: number[]
    if (slots) {
      _slots = slots
    } else {
      _slots = await Promise.all(
        tokens.map(async (token, i) => findTokenBalanceSlot(account, token, isVyperMapping[i]))
      )
      console.log(`slots: ${_slots}`)
    }

    for (let i = 0; i < tokens.length; i++) {
      await setupToken(humanBalances[i], tokens[i], isVyperMapping[i], _slots[i])
    }
  }

  async function setupToken(
    humanBalance: HumanAmount,
    tokenAddress: Address,
    isVyperMapping = false,
    slot?: number
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      await client.impersonateAccount({ address: account })
    }

    let _slot: number
    if (slot) _slot = slot
    else _slot = await findTokenBalanceSlot(account, tokenAddress, isVyperMapping)
    // console.log(`slot: ${_slot}`)

    // Set initial account balance for the token that will be used to join pool
    const balance = toEvmTokenBalance(humanBalance, tokenAddress)
    await setTokenBalance(tokenAddress, _slot, balance, false)

    // Approve appropriate allowances so that vault contract can move tokens
    await approveToken(account, tokenAddress)
  }

  function toEvmTokenBalance(humanBalance: HumanAmount, tokenAddress: Address): bigint {
    // when token is BPT token we set the pool balance
    if (isSameAddress(tokenAddress, pool.address)) return parseUnits(humanBalance, 18)

    const foundToken = getPoolTokens().find(t => isSameAddress(tokenAddress, t.address))
    if (!foundToken) throw new Error(`Token with address: ${tokenAddress} not found`)
    return parseUnits(humanBalance, foundToken.decimals)
  }

  /*
   * Setup local fork with pool balance for the current account address
   */
  async function setUserPoolBalance(humanBalance: HumanAmount) {
    return await setupToken(humanBalance, pool.address as Address)
  }
}
