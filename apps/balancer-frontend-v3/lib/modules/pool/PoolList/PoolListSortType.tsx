'use client'

import { Box } from '@chakra-ui/react'
import { usePoolListQueryState } from './usePoolListQueryState'
import { orderByHash, SortingState } from '../pool.types'
import { usePoolOrderByState } from './usePoolOrderByState'
import { GroupBase, OptionBase, Select, SingleValue } from 'chakra-react-select'
import { ReactNode, useMemo } from 'react'
import { getSelectStyles } from '@/lib/shared/services/chakra/custom/chakra-react-select'
import { useIsMounted } from '@/lib/shared/hooks/useIsMounted'

interface SortOption extends OptionBase {
  label: ReactNode
  value: SortingState
}

export function PoolListSortType() {
  const isMounted = useIsMounted()
  const { sorting, setSorting } = usePoolListQueryState()
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
        instanceId="pool-list-sort"
        value={_value}
        options={options}
        onChange={handleChange}
        chakraStyles={chakraStyles}
      />
    </Box>
  )
}
