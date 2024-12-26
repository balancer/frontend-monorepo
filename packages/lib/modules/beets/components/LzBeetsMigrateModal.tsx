'use client'

import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import {
  Button,
  HStack,
  ModalFooter,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  VStack,
  Box,
  Checkbox,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { type BaseError, useBalance, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { ErrorAlert } from '@repo/lib/shared/components/errors/ErrorAlert'
import { getBlockExplorerTxUrl } from '@repo/lib/shared/hooks/useBlockExplorer'
import Link from 'next/link'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { Address, formatUnits } from 'viem'
import { useTokenAllowances } from '@repo/lib/modules/web3/useTokenAllowances'
import {
  TokenBalancesProvider,
  useTokenBalances,
} from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { QueryObserverResult } from '@tanstack/react-query'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import NextLink from 'next/link'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'

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
  refetchBalances: () => Promise<QueryObserverResult<unknown, Error>[]>
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
    if (isConfirmed) {
      refetchBalances()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {isConfirmed && !!hash && (
        <Button
          as={Link}
          href={getBlockExplorerTxUrl(hash, GqlChain.Sonic)}
          variant="flat"
          w="full"
        >
          View on explorer
        </Button>
      )}
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
              : 'Claim'}
      </Button>
    </>
  )
}

function ApproveButton({
  balance,
  isBalancesRefetching,
  refetchBalances,
}: {
  balance: bigint
  isBalancesRefetching: boolean
  refetchBalances: () => Promise<QueryObserverResult<unknown, Error>[]>
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {isConfirmed && !!hash && (
        <Button
          as={Link}
          href={getBlockExplorerTxUrl(hash, GqlChain.Sonic)}
          variant="flat"
          w="full"
        >
          View on explorer
        </Button>
      )}
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

export function LzBeetsMigrateModal() {
  const { getTokensByChain } = useTokens()

  return (
    <TokenBalancesProvider initTokens={getTokensByChain(GqlChain.Sonic)}>
      <LzBeetsMigrateModalContent />
    </TokenBalancesProvider>
  )
}
/* 
function LzBeetsMigratorContent() {
  const { isConnected, userAddress } = useUserAccount()
  const [shouldShow, setShouldShow] = useState(false)
  const { refetchBalances, isBalancesRefetching } = useTokenBalances()
  const { data: balanceData } = useBalance({
    chainId: sonicChainId,
    address: userAddress,
    token: lzBeetsAddress,
  })

  const { allowances } = useTokenAllowances({
    chainId: sonicChainId,
    userAddress: userAddress as Address,
    spenderAddress: migratorAddress,
    tokenAddresses: [lzBeetsAddress],
  })

  const balance = formatUnits(balanceData?.value || 0n, balanceData?.decimals || 18)
  const hasBalance = bn(balanceData?.value || 0n).gt(0)
  const hasAllowance = bn(allowances[lzBeetsAddress] || 0n).gt(bn(balanceData?.value || 0n))

  useEffect(() => {
    if (hasBalance && !shouldShow) {
      setShouldShow(true)
    }
  }, [hasBalance])

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
            <span>{fNum('token', balance)} lzBEETS</span>
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold">Migrate your BEETS</PopoverHeader>
        <PopoverBody>
          When migrating BEETS from Fantom, you'll receive lzBEETS as a receipt token. Exchange your
          lzBEETS for BEETS on Sonic here.
          {isConnected ? (
            hasAllowance ? (
              <MigrationButton
                balance={balanceData?.value || 0n}
                isBalancesRefetching={isBalancesRefetching}
                refetchBalances={refetchBalances}
              />
            ) : (
              <ApproveButton
                balance={balanceData?.value || 0n}
                isBalancesRefetching={isBalancesRefetching}
                refetchBalances={refetchBalances}
              />
            )
          ) : (
            <ConnectWallet mt="md" variant="primary" w="full" />
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
} */

export function LzBeetsMigrateModalContent() {
  const [shouldShow, setShouldShow] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isConnected, userAddress } = useUserAccount()
  const { refetchBalances, isBalancesRefetching } = useTokenBalances()
  const { data: balanceData } = useBalance({
    chainId: sonicChainId,
    address: userAddress,
    token: lzBeetsAddress,
  })

  const { allowances } = useTokenAllowances({
    chainId: sonicChainId,
    userAddress: userAddress as Address,
    spenderAddress: migratorAddress,
    tokenAddresses: [lzBeetsAddress],
  })

  const balance = formatUnits(balanceData?.value || 0n, balanceData?.decimals || 18)
  const hasBalance = bn(balanceData?.value || 0n).gt(0)
  const hasAllowance = bn(allowances[lzBeetsAddress] || 0n).gt(bn(balanceData?.value || 0n))

  useEffect(() => {
    if (hasBalance && !isOpen && shouldShow) {
      onOpen()
    }
  }, [hasBalance, isOpen, shouldShow])

  function handleClose() {
    onClose()
    setShouldShow(false)
  }

  return (
    <Modal isCentered isOpen={isOpen} onClose={handleClose} preserveScrollBarGap>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Claim your Sonic BEETS</ModalHeader>
        <ModalCloseButton onClick={handleClose} />
        <ModalBody color="grayText">
          <Box mb="lg">
            <TokenRow
              abbreviated={false}
              address={lzBeetsAddress as Address}
              chain={GqlChain.Sonic}
              isLoading={false}
              value={balance}
              logoURI="https://beethoven-assets.s3.eu-central-1.amazonaws.com/token-stargate-transitonBEETS.svg"
              showZeroAmountAsDash={true}
            />
          </Box>
          <Text color="font.secondary">
            You have {balance} lzBEETS in your wallet. lzBEETS serve as a receipt token when
            bridging to Sonic. Exchange your lzBEETS for native BEETS on Sonic.
          </Text>
        </ModalBody>

        <ModalFooter alignItems="flex-start" flexDirection="column">
          {isConnected ? (
            hasAllowance ? (
              <MigrationButton
                balance={balanceData?.value || 0n}
                isBalancesRefetching={isBalancesRefetching}
                refetchBalances={refetchBalances}
              />
            ) : (
              <ApproveButton
                balance={balanceData?.value || 0n}
                isBalancesRefetching={isBalancesRefetching}
                refetchBalances={refetchBalances}
              />
            )
          ) : (
            <ConnectWallet mt="md" variant="primary" w="full" />
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
