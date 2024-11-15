import { FormControl, Box } from '@chakra-ui/react'
import { SearchInput } from '@repo/lib/shared/components/inputs/SearchInput'
import { useVoteList } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'

export function VoteListSearch() {
  const {
    loading,
    filtersState: { searchText, setSearch },
  } = useVoteList()

  return (
    <Box w={{ base: 'full', lg: 'sm' }}>
      <form>
        <FormControl w="full">
          <SearchInput
            ariaLabel="search for a voting pool"
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
