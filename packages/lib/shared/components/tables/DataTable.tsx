import * as React from 'react'
import {
  Center,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  chakra,
} from '@chakra-ui/react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { SortingIcon } from '@repo/lib/shared/components/icons/SortingIcon'
import { Pagination } from '@repo/lib/shared/components/pagination/Pagination'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import Link from 'next/link'

export type DataTableProps<Data extends object> = {
  data: Data[]
  columns: ColumnDef<Data, any>[]
  rowClickHandler?: (event: React.MouseEvent<HTMLElement>, rowData: Data) => void
  rowMouseEnterHandler?: (event: React.MouseEvent<HTMLElement>, rowData: Data) => void
  rowCount: number
  pagination: PaginationState
  sorting: SortingState
  setSorting: (state: SortingState) => void
  setPagination: (state: PaginationState) => void
  noResultsText: string
  noColumnPadding?: string[]
}

export function DataTable<Data extends object>({
  data,
  columns,
  rowCount,
  pagination,
  sorting,
  setPagination,
  setSorting,
  noResultsText,
  noColumnPadding,
}: DataTableProps<Data>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination,
    },
    pageCount: Math.ceil(rowCount / pagination.pageSize),
    onPaginationChange: updaterOrValue => {
      setPagination(
        (typeof updaterOrValue === 'function'
          ? updaterOrValue(pagination)
          : pagination) as PaginationState
      )
    },
    onSortingChange: updaterOrValue => {
      setSorting(
        (typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : sorting) as SortingState
      )
    },
    manualSorting: true,
    enableSortingRemoval: false,
    sortDescFirst: true,
    manualPagination: true,
  })

  const rows = table.getRowModel().rows

  return (
    <>
      <TableContainer pr="20px">
        <Table layout="fixed" minW="768px">
          <Thead>
            {table.getHeaderGroups().map(headerGroup => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                  const meta: any = header.column.columnDef.meta
                  const width = header.getSize()
                  return (
                    <Th
                      isNumeric={meta?.isNumeric}
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      p={noColumnPadding && noColumnPadding.includes(header.id) ? '0' : ''}
                      w={width === 9999 ? 'auto' : `${width}px`} // use '9999' in your column definition, for one column only!!
                    >
                      <HStack
                        style={
                          header.column.getCanSort() ? { position: 'relative', right: '-20px' } : {}
                        }
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())} -{' '}
                        {header.column.getCanSort() && (
                          <chakra.span cursor="pointer" h="full">
                            {{
                              asc: <SortingIcon direction="asc" />,
                              desc: <SortingIcon direction="desc" />,
                            }[header.column.getIsSorted() as string] ?? <SortingIcon />}
                          </chakra.span>
                        )}
                      </HStack>
                    </Th>
                  )
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {rows.map(row => (
              <Tr
                key={row.id}
                /*onClick={event => rowClickHandler && rowClickHandler(event, row.original)}
                cursor={rowClickHandler ? 'pointer' : 'default'}
                onMouseEnter={event =>
                  rowMouseEnterHandler && rowMouseEnterHandler(event, row.original)
                }*/
              >
                {row.getVisibleCells().map(cell => {
                  // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                  const meta: any = cell.column.columnDef.meta
                  const pool = row.original as any

                  return (
                    <Td
                      isNumeric={meta?.isNumeric}
                      key={cell.id}
                      px={noColumnPadding && noColumnPadding.includes(cell.column.id) ? '0' : '6'}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      {cell.id.includes('_detail') && (
                        <Link href={getPoolPath(pool)} prefetch style={{ color: '#2299DD' }}>
                          Pre-Fetched Link
                        </Link>
                      )}
                    </Td>
                  )
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {!rows.length && (
        <Center h="200px" w="full">
          {noResultsText}
        </Center>
      )}
      {!!rows.length && rowCount > pagination.pageSize && (
        <Pagination
          canNextPage={table.getCanNextPage()}
          canPreviousPage={table.getCanPreviousPage()}
          currentPageNumber={table.getState().pagination.pageIndex + 1}
          goToFirstPage={() => table.setPageIndex(0)}
          goToLastPage={() => table.setPageIndex(table.getPageCount() - 1)}
          goToNextPage={() => table.nextPage()}
          goToPreviousPage={() => table.previousPage()}
          pageSize={table.getState().pagination.pageSize}
          setPageSize={table.setPageSize}
          totalPageCount={table.getPageCount()}
        />
      )}
    </>
  )
}
