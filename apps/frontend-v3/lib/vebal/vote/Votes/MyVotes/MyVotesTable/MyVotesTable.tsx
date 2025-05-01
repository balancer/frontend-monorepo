'use client'

import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { MyVotesTableHeader } from './MyVotesTableHeader'
import { MyVotesTableRow } from './MyVotesTableRow'
import { Card, Skeleton } from '@chakra-ui/react'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { useMemo } from 'react'
import { MyVotesTotalRow } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesTable/MyVotesTableTotalRow'
import { MyVotesSubmitRow } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesTable/MyVotesTableSubmitRow'
import { useTotalVotes } from '../../../useTotalVotes'

interface Props {
  myVotes: VotingPoolWithData[]
  loading: boolean
}

enum RowType {
  Data = 'Data',
  Total = 'Total',
  Submit = 'Submit',
}

const rowProps = {
  px: { base: 'sm', sm: '0' },
  gridTemplateColumns: `32px minmax(320px, 1fr) 100px 120px 120px 120px 50px`,
  alignItems: 'center',
  gap: { base: 'xxs', xl: 'lg' },
}

export function MyVotesTable({ myVotes, loading }: Props) {
  const isMounted = useIsMounted()
  const { totalVotes, totalVotesLoading } = useTotalVotes()

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
      <PaginatedTable
        getRowId={item => item.id}
        items={items}
        loading={loading || totalVotesLoading}
        loadingLength={3}
        noItemsFoundLabel="You don’t have any active or proposed votes. Add some votes from the table below."
        paginationProps={undefined}
        renderTableHeader={TableHeader}
        renderTableRow={TableRow}
        showPagination={false}
      />
    </Card>
  )
}
