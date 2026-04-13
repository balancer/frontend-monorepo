import { ReactNode, useEffect, useRef } from 'react'
import {
  Box,
  BoxProps,
  Center,
  Divider,
  Text,
  VStack,
  Skeleton,
  StyleProps,
} from '@chakra-ui/react'
import { Pagination, PaginationProps } from '@repo/lib/shared/components/pagination/Pagination'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

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
  headerHeight?: number
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
  headerHeight = 68,
  ...rest
}: Props<T>) {
  const previousPageCountRef = useRef(0)
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  useEffect(() => {
    // When the number of pages changes, reset to first page
    if (paginationProps && paginationProps.totalPageCount !== previousPageCountRef.current) {
      previousPageCountRef.current = paginationProps.totalPageCount
      paginationProps.goToFirstPage()
    }
  }, [paginationProps])

  // Reset scroll when items change (pagination)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [paginationProps?.currentPageNumber])

  return (
    <VStack align="stretch" gap="0" h="full" w="full" {...rest}>
      <Box flexShrink={0} h={`${headerHeight}px`} w="full">
        <TableHeader />
      </Box>
      <Divider flexShrink={0} />
      <Box flex="1" minH="0" position="relative" w="full">
        {items.length > 0 ? (
          <Virtuoso
            data={items}
            initialItemCount={10}
            itemContent={(index, item) => (
              <Box key={getRowId(item, index)} w="full">
                <TableRow index={index} item={item} />
              </Box>
            )}
            ref={virtuosoRef}
            totalCount={items.length}
            useWindowScroll
          />
        ) : loading ? (
          <VStack gap="0" w="full">
            {Array.from({ length: loadingLength }).map((_, index) => (
              <Box key={`table-row-skeleton-${index}`} px="xs" py="xs" w="full">
                <Skeleton height="68px" w="full" />
              </Box>
            ))}
          </VStack>
        ) : (
          <Center py="2xl">
            <Text color="font.secondary" px="md">
              {noItemsFoundLabel}
            </Text>
          </Center>
        )}
      </Box>

      {showPagination && paginationProps && (
        <>
          <Divider flexShrink={0} />
          <Pagination flexShrink={0} p="md" {...paginationProps} {...paginationStyles} />
        </>
      )}
    </VStack>
  )
}
