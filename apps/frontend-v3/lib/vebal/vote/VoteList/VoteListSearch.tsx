import { Box, Field } from '@chakra-ui/react'
import { SearchInput } from '@repo/lib/shared/components/inputs/SearchInput'
import { useVoteList } from '@bal/lib/vebal/vote/VoteList/VoteListProvider'

export function VoteListSearch() {
  const {
    loading,
    filtersState: { searchText, setSearch },
  } = useVoteList()

  return (
    <Box w={{ base: 'full', lg: 'sm' }}>
      <form>
        <Field.Root w="full">
          <SearchInput
            ariaLabel="search for a voting pool"
            autoFocus={false}
            loading={loading}
            placeholder="Search by token..."
            search={searchText}
            setSearch={setSearch}
          />
        </Field.Root>
      </form>
    </Box>
  )
}
