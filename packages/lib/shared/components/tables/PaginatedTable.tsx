import { ReactNode, useEffect, useState } from 'react'
import {
  Box,
  BoxProps,
  Center,
  Divider,
  Text,
  Spinner,
  VStack,
  Skeleton,
  StyleProps,
} from '@chakra-ui/react'
import { Pagination, PaginationProps } from '@repo/lib/shared/components/pagination/Pagination'

interface Props<T> extends BoxProps {
  items: T[]
  loading: boolean
  renderTableHeader: () => ReactNode
  renderTableRow: (props: { item: T; index: number }) => ReactNode
  showPagination: boolean
  paginationProps: PaginationProps | undefined
  noItemsFoundLabel: string
  getRowId: (item: T, index: number) => React.Key
  loadingLength?: number
  paginationStyles?: StyleProps
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
  paginationStyles,
}: Props<T>) {
  const [previousPageCount, setPreviousPageCount] = useState(0)

  useEffect(() => {
    // When the number of pages changes (eg. new filter) we have to go back to
    // the first page because the current page could not exist anymore or could
    // be a different page and that can be confusing to the user
    if (paginationProps && paginationProps.totalPageCount !== previousPageCount) {
      setPreviousPageCount(paginationProps.totalPageCount)
      paginationProps.goToFirstPage()
    }
  }, [paginationProps, previousPageCount])

  return (
    <>
      <VStack className="hide-scrollbar" gap="0" overflowX="scroll" w="full">
        <TableHeader />
        <Divider />
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
      {showPagination && paginationProps && (
        <>
          <Divider />
          <Pagination p="md" {...paginationProps} {...paginationStyles} />
        </>
      )}
    </>
  )
}
