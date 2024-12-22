/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import {
  Button,
  HStack,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { type BaseError, useBalance, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { ErrorAlert } from '@repo/lib/shared/components/errors/ErrorAlert'
// import { getBlockExplorerTxUrl } from '@repo/lib/shared/hooks/useBlockExplorer'
// import Link from 'next/link'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { Address, formatUnits } from 'viem'
import { useTokenAllowances } from '@repo/lib/modules/web3/useTokenAllowances'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { NetworkSwitchButton, useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'

const sonicChainId = 146
const lzBeetsAddress = '0x1E5fe95fB90ac0530F581C617272cd0864626795'
const migratorAddress = '0x5f9a5CD0B77155AC1814EF6Cd9D82dA53d05E386'

function MigrationButton({
  balance,
  isBalancesRefetching,
  refetchBalances,
}: {
  balance: bigint
  isBalancesRefetching: boolean
  refetchBalances: any
}) {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const hasLzBeetsBalance = bn(balance).gt(0)

  function migrate() {
    writeContract({
      address: migratorAddress,
      abi: [
        {
          name: 'exchangeOperaToSonic',
          type: 'function',
          inputs: [{ type: 'uint256' }],
          outputs: [],
        },
      ],
      functionName: 'exchangeOperaToSonic',
      chainId: sonicChainId,
      args: [balance],
    })
  }

  useEffect(() => {
    if (isConfirmed && !!hash) {
      refetchBalances()
    }
  }, [isConfirmed, hash])

  return (
    <>
      {error && (
        <ErrorAlert>
          <Text color="black" variant="secondary">
            Error: {(error as BaseError).shortMessage || error.message}
          </Text>
        </ErrorAlert>
      )}
      {/* {isConfirmed && !!hash && (
        <Button
          as={Link}
          href={getBlockExplorerTxUrl(hash, GqlChain.Sonic)}
          target="_blank"
          variant="flat"
          w="full"
        >
          View on explorer
        </Button>
      )} */}
      <Button
        disabled={
          isPending || isConfirming || isBalancesRefetching || isConfirmed || !hasLzBeetsBalance
        }
        isDisabled={
          isPending || isConfirming || isBalancesRefetching || isConfirmed || !hasLzBeetsBalance
        }
        isLoading={isPending || isConfirming}
        mt="md"
        onClick={migrate}
        variant={isConfirmed ? 'flat' : 'primary'}
        w="full"
      >
        {isPending
          ? 'Confirm in wallet...'
          : isConfirming
            ? 'Confirming...'
            : isConfirmed
              ? 'Confirmed!'
              : 'Migrate'}
      </Button>
    </>
  )
}

function ApproveButton({
  balance,
  isBalancesRefetching,
  refetchBalances,
  refetchAllowances,
}: {
  balance: bigint
  isBalancesRefetching: boolean
  refetchBalances: any // TODO: type this or leave it
  refetchAllowances: any // TODO: type this or leave it
}) {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const hasLzBeetsBalance = bn(balance).gt(0)

  function approve() {
    writeContract({
      address: lzBeetsAddress,
      abi: [
        {
          name: 'approve',
          type: 'function',
          inputs: [{ type: 'address' }, { type: 'uint256' }],
          outputs: [],
        },
      ],
      functionName: 'approve',
      chainId: sonicChainId,
      args: [migratorAddress, balance],
    })
  }

  useEffect(() => {
    if (isConfirmed) {
      refetchBalances()
      refetchAllowances()
    }
  }, [isConfirmed])

  return (
    <>
      {error && (
        <ErrorAlert>
          <Text color="black" variant="secondary">
            Error: {(error as BaseError).shortMessage || error.message}
          </Text>
        </ErrorAlert>
      )}
      {/* {isConfirmed && !!hash && (
        <Button
          as={Link}
          href={getBlockExplorerTxUrl(hash, GqlChain.Sonic)}
          target="_blank"
          variant="flat"
          w="full"
        >
          View on explorer
        </Button>
      )} */}
      <Button
        disabled={
          isPending || isConfirming || isBalancesRefetching || isConfirmed || !hasLzBeetsBalance
        }
        isDisabled={
          isPending || isConfirming || isBalancesRefetching || isConfirmed || !hasLzBeetsBalance
        }
        isLoading={isPending || isConfirming}
        mt="md"
        onClick={approve}
        variant={isConfirmed ? 'flat' : 'primary'}
        w="full"
      >
        {isPending
          ? 'Confirm in wallet...'
          : isConfirming
            ? 'Confirming...'
            : isConfirmed
              ? 'Confirmed!'
              : 'Approve'}
      </Button>
    </>
  )
}

export function LzBeetsMigrator() {
  const { getTokensByChain } = useTokens()

  return (
    <TokenBalancesProvider initTokens={getTokensByChain(GqlChain.Sonic)}>
      <LzBeetsMigratorContent />
    </TokenBalancesProvider>
  )
}

function LzBeetsMigratorContent() {
  const { isConnected, userAddress } = useUserAccount()
  //const [shouldShow, setShouldShow] = useState(false)
  //const { refetchBalances, isBalancesRefetching } = useTokenBalances()
  const { shouldChangeNetwork, networkSwitchButtonProps } = useChainSwitch(sonicChainId)
  const [balanceToShow, setBalanceToShow] = useState<bigint>(0n)

  const {
    data: balanceData,
    isLoading,
    refetch: refetchBalances,
    isRefetching: isBalancesRefetching,
  } = useBalance({
    chainId: sonicChainId,
    address: userAddress,
    token: lzBeetsAddress,
    query: {
      enabled: !!userAddress,
    },
  })

  const { allowances, refetchAllowances } = useTokenAllowances({
    chainId: sonicChainId,
    userAddress: userAddress as Address,
    spenderAddress: migratorAddress,
    tokenAddresses: [lzBeetsAddress],
  })

  useEffect(() => {
    setBalanceToShow(balanceData?.value || 0n)
  }, [balanceData])

  const balance = formatUnits(balanceToShow, balanceData?.decimals || 18)
  //const hasBalance = bn(balanceData?.value || 0n).gt(0)
  const hasAllowance =
    balance !== '0' && bn(allowances[lzBeetsAddress] || 0n).gte(bn(balanceData?.value || 0n))

  useEffect(() => {
    if (!shouldChangeNetwork || userAddress) {
      refetchBalances()
      refetchAllowances()
    }
  }, [shouldChangeNetwork, userAddress])

  // useEffect(() => {
  //   if (hasBalance && !shouldShow) {
  //     setShouldShow(true)
  //   }
  // }, [hasBalance])

  /* if (!shouldShow) {
    return null
  } */

  return (
    <Popover>
      <PopoverTrigger>
        <Button>
          <HStack>
            <TokenIcon
              address="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
              alt="lzBEETS"
              chain={1}
              logoURI="https://beethoven-assets.s3.eu-central-1.amazonaws.com/token-stargate-transitonBEETS.svg"
              size={24}
            />
            <HStack>
              {isLoading ? <Spinner size="sm" /> : <Text>{fNum('token', balance)}</Text>}
              <Text> lzBEETS</Text>
            </HStack>
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold">Migrate your BEETS</PopoverHeader>
        <PopoverBody>
          <VStack>
            <Text color="grayText">
              When migrating BEETS from Fantom, you&apos;ll receive lzBEETS as a receipt token.
            </Text>
            <Text color="grayText">Exchange your lzBEETS for BEETS on Sonic here.</Text>
            {isConnected ? (
              shouldChangeNetwork ? (
                <NetworkSwitchButton {...networkSwitchButtonProps} />
              ) : hasAllowance ? (
                <MigrationButton
                  balance={balanceData?.value || 0n}
                  isBalancesRefetching={isBalancesRefetching}
                  refetchBalances={refetchBalances}
                />
              ) : (
                <ApproveButton
                  balance={balanceData?.value || 0n}
                  isBalancesRefetching={isBalancesRefetching}
                  refetchAllowances={refetchAllowances}
                  refetchBalances={refetchBalances}
                />
              )
            ) : (
              <ConnectWallet mt="md" variant="primary" w="full" />
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
