import { FormControl, Box } from '@chakra-ui/react'
import { usePoolList } from './PoolListProvider'
import { SearchInput } from '@repo/lib/shared/components/inputs/SearchInput'

export function PoolListSearch() {
  const {
    loading,
    queryState: { searchText, setSearch },
  } = usePoolList()

  return (
    <Box w={{ base: 'full', lg: 'sm' }}>
      <form>
        <FormControl w="full">
          <SearchInput
            ariaLabel="search for a pool"
            autoFocus={false}
            isLoading={loading}
            placeholder="Search by name, symbol or address"
            search={searchText}
            setSearch={setSearch}
          />
        </FormControl>
      </form>
    </Box>
  )
}
