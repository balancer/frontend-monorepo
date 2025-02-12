import { ReactNode } from 'react'
import { Box, BoxProps, Center, Text, Spinner, VStack, Skeleton } from '@chakra-ui/react'
import { Pagination } from '@repo/lib/shared/components/pagination/Pagination'

interface Props<T> extends BoxProps {
  items: T[]
  loading: boolean
  renderTableHeader: () => ReactNode
  renderTableRow: (props: { item: T; index: number }) => ReactNode
  showPagination: boolean
  paginationProps: any // TODO: type this
  noItemsFoundLabel: string
  getRowId: (item: T, index: number) => React.Key
  loadingLength?: number
}

export function PaginatedTable<T>({
  items,
  loading,
  renderTableRow: TableRow,
  renderTableHeader: TableHeader,
  showPagination,
  paginationProps,
  noItemsFoundLabel,
  getRowId,
  loadingLength = 20,
}: Props<T>) {
  return (
    <>
      <VStack className="hide-scrollbar" overflowX="scroll" w="full">
        <TableHeader />
        <Box position="relative" w="full">
          {items.length > 0 && (
            <VStack gap="0">
              {items.map((item, index) => (
                <Box key={getRowId(item, index)} w="full">
                  <TableRow index={index} item={item} />
                </Box>
              ))}
            </VStack>
          )}
          {!loading && items.length === 0 && (
            <Center py="2xl">
              <Text color="font.secondary">{noItemsFoundLabel}</Text>
            </Center>
          )}
          {loading &&
            items.length === 0 &&
            Array.from({ length: loadingLength }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Box key={`table-row-skeleton-${index}`} px="xs" py="xs" w="full">
                <Skeleton height="68px" w="full" />
              </Box>
            ))}
          {loading && items.length > 0 && (
            <Box>
              <Box
                style={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  top: 0,
                  left: 0,
                  borderRadius: 10,
                  zIndex: 10,
                  backdropFilter: 'blur(3px)',
                }}
              >
                <Center py="4xl">
                  <Spinner size="xl" />
                </Center>
              </Box>
            </Box>
          )}
        </Box>
      </VStack>
      {showPagination && <Pagination p="md" {...paginationProps} />}
    </>
  )
}
