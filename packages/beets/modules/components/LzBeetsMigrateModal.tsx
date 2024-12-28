'use client'

import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import {
  TokenBalancesProvider,
  useTokenBalances,
} from '@repo/lib/modules/tokens/TokenBalancesProvider'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { NetworkSwitchButton, useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokenAllowances } from '@repo/lib/modules/web3/useTokenAllowances'
import { ErrorAlert } from '@repo/lib/shared/components/errors/ErrorAlert'
import { getBlockExplorerTxUrl } from '@repo/lib/shared/hooks/useBlockExplorer'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { bn } from '@repo/lib/shared/utils/numbers'
import { QueryObserverResult } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Address, formatUnits } from 'viem'
import { type BaseError, useBalance, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

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
  refetchAllowances,
  isAllowancesLoading,
}: {
  balance: bigint
  refetchAllowances: () => void
  isAllowancesLoading: boolean
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
      refetchAllowances()
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
      <Button
        disabled={
          isPending || isConfirming || isAllowancesLoading || isConfirmed || !hasLzBeetsBalance
        }
        isDisabled={
          isPending || isConfirming || isAllowancesLoading || isConfirmed || !hasLzBeetsBalance
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

export function LzBeetsMigrateModalContent() {
  const { shouldChangeNetwork } = useChainSwitch(sonicChainId)
  const [shouldShow, setShouldShow] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isConnected, userAddress } = useUserAccount()
  const { refetchBalances, isBalancesRefetching } = useTokenBalances()
  const { data: balanceData } = useBalance({
    chainId: sonicChainId,
    address: userAddress,
    token: lzBeetsAddress,
  })

  const { allowances, refetchAllowances, isAllowancesRefetching, isAllowancesLoading } =
    useTokenAllowances({
      chainId: sonicChainId,
      userAddress: userAddress as Address,
      spenderAddress: migratorAddress,
      tokenAddresses: [lzBeetsAddress],
    })

  const balance = formatUnits(balanceData?.value || 0n, balanceData?.decimals || 18)
  const hasBalance = bn(balanceData?.value || 0n).gt(0)
  const hasAllowance = bn(allowances[lzBeetsAddress] || 0n).gte(bn(balanceData?.value || 0n))

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
              logoURI="https://beethoven-assets.s3.eu-central-1.amazonaws.com/token-stargate-transitonBEETS.svg"
              showZeroAmountAsDash
              value={balance}
            />
          </Box>
          <Text color="font.secondary">
            You have {balance} lzBEETS in your wallet. lzBEETS serve as a receipt token when
            bridging to Sonic. Claim your BEETS on Sonic now.
          </Text>
        </ModalBody>

        <ModalFooter alignItems="flex-start" flexDirection="column">
          {isConnected ? (
            shouldChangeNetwork ? (
              <NetworkSwitchButton chainId={sonicChainId} />
            ) : hasAllowance ? (
              <MigrationButton
                balance={balanceData?.value || 0n}
                isBalancesRefetching={isBalancesRefetching}
                refetchBalances={refetchBalances}
              />
            ) : (
              <ApproveButton
                balance={balanceData?.value || 0n}
                isAllowancesLoading={isAllowancesLoading || isAllowancesRefetching}
                refetchAllowances={refetchAllowances}
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
