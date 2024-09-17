import { FormControl, Box } from '@chakra-ui/react'
import { usePoolListQueryState } from './usePoolListQueryState'
import { usePoolList } from './PoolListProvider'
import { SearchInput } from '@/lib/shared/components/inputs/SearchInput'

export function PoolListSearch() {
  const { searchText, setSearch } = usePoolListQueryState()
  const { loading } = usePoolList()

  return (
    <Box w={{ base: 'full', lg: 'sm' }}>
      <form>
        <FormControl w="full">
          <SearchInput
            search={searchText}
            setSearch={setSearch}
            placeholder="Search..."
            ariaLabel="search for a pool"
            isLoading={loading}
          />
        </FormControl>
      </form>
    </Box>
  )
}
