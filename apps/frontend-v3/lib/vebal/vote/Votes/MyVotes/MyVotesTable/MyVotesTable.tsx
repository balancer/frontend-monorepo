'use client'

import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { MyVotesTableHeader } from './MyVotesTableHeader'
import { MyVotesTableRow } from './MyVotesTableRow'
import { Button, Card, Skeleton, VStack } from '@chakra-ui/react'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { useMemo } from 'react'
import { MyVotesTotalRow } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesTable/MyVotesTableTotalRow'
import { MyVotesSubmitRow } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesTable/MyVotesTableSubmitRow'
import { useTotalVotes } from '../../../useTotalVotes'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'

interface Props {
  myVotes: VotingPoolWithData[]
  loading: boolean
  noVeBALBalance: boolean
}

enum RowType {
  Data = 'Data',
  Total = 'Total',
  Submit = 'Submit',
}

const rowProps = {
  px: { base: 'sm', sm: '0' },
  gridTemplateColumns: `32px minmax(320px, 1fr) minmax(100px, max-content) minmax(120px, max-content) minmax(140px, max-content) minmax(120px, max-content) 50px`,
  alignItems: 'center',
  gap: { base: 'xxs', xl: 'lg' },
}

export function MyVotesTable({ myVotes, loading, noVeBALBalance }: Props) {
  const isMounted = useIsMounted()
  const { totalVotes, totalVotesLoading } = useTotalVotes()
  const { isConnected } = useUserAccount()
  const { loadDebugVotes } = useMyVotes()

  const items = useMemo(() => {
    if (myVotes.length === 0) {
      return []
    }

    const rows = myVotes.map(
      myVote =>
        ({
          id: myVote.id,
          vote: myVote,
          type: RowType.Data,
        }) as const
    )

    return [
      ...rows,
      {
        id: RowType.Total,
        type: RowType.Total,
      } as const,
      {
        id: RowType.Submit,
        type: RowType.Submit,
      } as const,
    ]
  }, [myVotes])

  const TableHeader = useMemo(() => {
    return function TableHeader() {
      return <MyVotesTableHeader cellProps={{}} {...rowProps} />
    }
  }, [])

  // Memoize component's link to skip recreation
  const TableRow = useMemo(() => {
    return function TableHeader({ item }: { item: (typeof items)[number]; index: number }) {
      if (item.type === RowType.Total) {
        return <MyVotesTotalRow cellProps={{}} keyValue={item.id} {...rowProps} />
      }

      if (item.type === RowType.Submit) {
        return <MyVotesSubmitRow cellProps={{}} keyValue={item.id} {...rowProps} />
      }

      return (
        <MyVotesTableRow
          cellProps={{}}
          keyValue={item.id}
          totalVotes={totalVotes}
          vote={item.vote}
          {...rowProps}
        />
      )
    }
  }, [totalVotes])

  if (!isMounted) return <Skeleton height="500px" w="full" />

  return (
    <Card
      alignItems="flex-start"
      left={{ base: '-4px', sm: '0' }}
      p={{ base: '0', sm: '0' }}
      position="relative"
      pr={{ base: 'md' }}
      w={{ base: '100vw', lg: 'full' }}
    >
      <VStack>
        <Button onClick={loadDebugVotes} variant="primary">
          Load debug votes
        </Button>
        <PaginatedTable
          getRowId={item => item.id}
          items={items}
          loading={loading || totalVotesLoading}
          loadingLength={3}
          noItemsFoundLabel={
            !isConnected
              ? 'Connect your wallet to see and edit your votes'
              : noVeBALBalance
                ? 'You don’t have any votes. Get some veBAL to start voting.'
                : 'You don’t have any votes. Start by selecting some pool gauges from the table below.'
          }
          paginationProps={undefined}
          renderTableHeader={TableHeader}
          renderTableRow={TableRow}
          showPagination={false}
        />
      </VStack>
    </Card>
  )
}
