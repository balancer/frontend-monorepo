import { FormControl, Box } from '@chakra-ui/react'
import { usePoolListQueryState } from './usePoolListQueryState'
import { usePoolList } from './PoolListProvider'
import { SearchInput } from '@repo/lib/shared/components/inputs/SearchInput'

export function PoolListSearch() {
  const { searchText, setSearch } = usePoolListQueryState()
  const { loading } = usePoolList()

  return (
    <Box w={{ base: 'full', lg: 'sm' }}>
      <form>
        <FormControl w="full">
          <SearchInput
            ariaLabel="search for a pool"
            isLoading={loading}
            placeholder="Search..."
            search={searchText}
            setSearch={setSearch}
          />
        </FormControl>
      </form>
    </Box>
  )
}
