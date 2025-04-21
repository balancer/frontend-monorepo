import { useState } from 'react'
import { SortingBy } from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.types'
import { Sorting } from '@repo/lib/shared/components/tables/SortableHeader'

export function useMyVotesFiltersState() {
  const [sorting, setSorting] = useState<Sorting>(Sorting.desc)
  const [sortingBy, setSortingBy] = useState<SortingBy>(SortingBy.currentVotes)

  function toggleSorting() {
    setSorting(sorting === Sorting.asc ? Sorting.desc : Sorting.asc)
  }

  return {
    sorting,
    setSorting,
    sortingBy,
    setSortingBy,
    toggleSorting,
  }
}
