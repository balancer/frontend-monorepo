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
  Text,
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
import { formatUnits } from 'viem'

const sonicChainId = 146
const lzBeetsAddress = '0x1E5fe95fB90ac0530F581C617272cd0864626795'
const migratorAddress = '0x0000000000000000000000000000000000000000'

function MigrationButton({ balance }: { balance: bigint }) {
  const [isRefetching, setIsRefetching] = useState(false)
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
    async function refetch() {
      setIsRefetching(true)
      // TODO: refetch balance
      setIsRefetching(false)
    }
    if (isConfirmed) {
      refetch()
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
        disabled={isPending || isConfirming || isRefetching || isConfirmed || !hasLzBeetsBalance}
        isDisabled={isPending || isConfirming || isRefetching || isConfirmed || !hasLzBeetsBalance}
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

export function LzBeetsMigrator() {
  const { isConnected, userAddress } = useUserAccount()

  const { data: balanceData } = useBalance({
    chainId: sonicChainId,
    address: userAddress,
    token: lzBeetsAddress,
  })

  const balance = formatUnits(balanceData?.value || 0n, balanceData?.decimals || 18)

  return (
    <Popover>
      <PopoverTrigger>
        <Button>
          <HStack>
            <TokenIcon
              address="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
              alt="LZBEETS"
              chain={1}
              size={24}
            />
            <span>{fNum('token', balance)} LZBEETS</span>
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold">Migrate your BEETS</PopoverHeader>
        <PopoverBody>
          Exchange your LZBEETS for BEETS on Sonic.
          {isConnected ? (
            <MigrationButton balance={balanceData?.value || 0n} />
          ) : (
            <ConnectWallet mt="md" variant="primary" w="full" />
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
