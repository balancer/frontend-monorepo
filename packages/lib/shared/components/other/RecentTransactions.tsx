import React from 'react'
import {
  Button,
  HStack,
  Heading,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
  Tooltip,
  VStack,
  Center,
  CircularProgress,
  CircularProgressLabel,
  Box,
} from '@chakra-ui/react'
import {
  TrackedTransaction,
  TransactionStatus,
  useRecentTransactions,
} from '@repo/lib/modules/transactions/RecentTransactionsProvider'
import { isEmpty, orderBy } from 'lodash'
import { Activity, ArrowUpRight, Check, Clock, X, XOctagon } from 'react-feather'
import { getChainShortName } from '@repo/lib/config/app.config'
import { formatDistanceToNow } from 'date-fns'
import { getBlockExplorerTxUrl } from '../../utils/blockExplorer'

function TransactionIcon({ status }: { status: TransactionStatus }) {
  switch (status) {
    case 'confirming':
      return (
        <CircularProgress
          color="orange.300"
          isIndeterminate
          size="5"
          trackColor="border.base"
          value={100}
        />
      )
    case 'confirmed':
      return (
        <Box color="font.highlight">
          <Check size={20} />
        </Box>
      )
    case 'reverted':
    case 'rejected':
      return (
        <Box color="red.500">
          <X size={20} />
        </Box>
      )
    case 'timeout':
      return (
        <Box color="yellow.500">
          <Clock size={20} />
        </Box>
      )
    case 'unknown':
      return (
        <Box color="yellow.500">
          <XOctagon size={20} />
        </Box>
      )
    default:
      return null
  }
}

function TransactionRow({ transaction }: { transaction: TrackedTransaction }) {
  // TODO? Add another description so it would always fit in the default width of 320px (ln 71) without truncation (ln 46)
  const label =
    transaction.description &&
    transaction.init &&
    transaction.description?.length > transaction.init.length
      ? transaction.description
      : transaction.init

  return (
    <HStack align="start" key={transaction.hash} py="sm" w="full">
      <TransactionIcon status={transaction.status} />
      <VStack align="start" spacing="none" w="full">
        <Tooltip fontSize="sm" label={label}>
          <Text isTruncated maxW="85%">
            {transaction.init}
          </Text>
        </Tooltip>
        <HStack fontSize="xs" spacing="xs">
          <Text color="grayText">
            {transaction.chain ? getChainShortName(transaction.chain) : 'Unknown'},&nbsp;
            {formatDistanceToNow(new Date(transaction.timestamp), {
              addSuffix: true,
            })}
          </Text>
          <Link
            color="grayText"
            href={getBlockExplorerTxUrl(transaction.hash, transaction.chain)}
            target="_blank"
          >
            <ArrowUpRight size={16} />
          </Link>
        </HStack>
      </VStack>
    </HStack>
  )
}

function Transactions({ transactions }: { transactions: Record<string, TrackedTransaction> }) {
  const orderedRecentTransactions = orderBy(Object.values(transactions), 'timestamp', 'desc')

  return (
    <VStack align="start" maxH="250px" overflowY="auto" p="md" spacing="none">
      {orderedRecentTransactions.map(transaction => (
        <TransactionRow key={transaction.hash} transaction={transaction} />
      ))}
    </VStack>
  )
}

export default function RecentTransactions() {
  const { transactions } = useRecentTransactions()
  const hasTransactions = !isEmpty(transactions)

  const confirmingTxCount = Object.values(transactions).filter(
    tx => tx.status === 'confirming'
  ).length

  return (
    <Popover>
      <PopoverTrigger>
        <Button p="0" variant="tertiary">
          {confirmingTxCount > 0 ? (
            <CircularProgress
              color="font.warning"
              isIndeterminate
              size="7"
              thickness="8"
              trackColor="border.base"
              value={100}
            >
              <CircularProgressLabel color="font.warning" fontSize="sm" fontWeight="bold">
                {confirmingTxCount}
              </CircularProgressLabel>
            </CircularProgress>
          ) : (
            <Activity size={20} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent w="330px">
        <PopoverArrow bg="background.level3" />
        <PopoverCloseButton />
        <PopoverBody p="0">
          <HStack color="font.primary" p="md" pb="0">
            <Activity size={18} />
            <Heading size="md" variant="special">
              Recent activity
            </Heading>
          </HStack>

          {hasTransactions ? (
            <Transactions transactions={transactions} />
          ) : (
            <Center p="md">
              <Text color="font.secondary">No transactions...</Text>
            </Center>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
