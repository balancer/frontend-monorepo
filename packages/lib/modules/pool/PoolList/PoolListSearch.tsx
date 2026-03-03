import { Box, Field } from '@chakra-ui/react';
import { usePoolList } from './PoolListProvider'
import { SearchInput } from '@repo/lib/shared/components/inputs/SearchInput'

export function PoolListSearch() {
  const {
    loading,
    queryState: { searchText, setSearch } } = usePoolList()

  return (
    <Box w={{ base: 'full', lg: 'sm' }}>
      <form>
        <Field.Root w="full">
          <SearchInput
            ariaLabel="search for a pool"
            autoFocus={false}
            isLoading={loading}
            placeholder="Search..."
            search={searchText}
            setSearch={setSearch}
          />
        </Field.Root>
      </form>
    </Box>
  );
}
