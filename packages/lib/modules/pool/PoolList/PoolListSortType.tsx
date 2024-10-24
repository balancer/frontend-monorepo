'use client'

import { Box } from '@chakra-ui/react'
import { orderByHash, SortingState } from '../pool.types'
import { usePoolOrderByState } from './usePoolOrderByState'
import { GroupBase, OptionBase, Select, SingleValue } from 'chakra-react-select'
import { ReactNode, useMemo } from 'react'
import { getSelectStyles } from '@repo/lib/shared/services/chakra/custom/chakra-react-select'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { usePoolList } from './PoolListProvider'

interface SortOption extends OptionBase {
  label: ReactNode
  value: SortingState
}

export function PoolListSortType() {
  const isMounted = useIsMounted()
  const {
    queryState: { sorting, setSorting },
  } = usePoolList()
  const { orderBy } = usePoolOrderByState()
  const chakraStyles = getSelectStyles<SortOption>()

  const options: SortOption[] = useMemo(
    () =>
      orderBy
        .map(sortType => [
          {
            label: `${orderByHash[sortType]} (high to low)`,
            value: [{ id: sortType, desc: true }],
          },
          {
            label: `${orderByHash[sortType]} (low to high)`,
            value: [{ id: sortType, desc: false }],
          },
        ])
        .flat(),
    [orderBy]
  )

  function handleChange(newOption: SingleValue<SortOption>) {
    if (newOption) setSorting(newOption.value)
  }

  const _value = options.find(
    option => option.value[0].id === sorting[0].id && option.value[0].desc === sorting[0].desc
  )

  if (!isMounted) return null

  return (
    <Box w="48">
      <Select<SortOption, false, GroupBase<SortOption>>
        chakraStyles={chakraStyles}
        instanceId="pool-list-sort"
        onChange={handleChange}
        options={options}
        value={_value}
      />
    </Box>
  )
}
