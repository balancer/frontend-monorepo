import { PaginationState } from './pagination.types'

export function getPaginationProps(
  totalRowCount: number,
  pagination: PaginationState,
  setPagination: (pagination: PaginationState) => void,
  changeSize = true,
  hideDropdown = false
) {
  const totalPageCount =
    totalRowCount % pagination.pageSize === 0
      ? totalRowCount / pagination.pageSize
      : Math.floor(totalRowCount / pagination.pageSize) + 1 // add extra page to account for remainder

  const canPreviousPage = pagination.pageIndex - 1 > -1
  const canNextPage = pagination.pageIndex + 1 < totalPageCount
  const currentPageNumber = pagination.pageIndex + 1
  const pageSize = pagination.pageSize

  const goToFirstPage = () => setPagination({ pageIndex: 0, pageSize: pagination.pageSize })
  const goToLastPage = () =>
    setPagination({ pageIndex: totalPageCount - 1, pageSize: pagination.pageSize })
  const goToNextPage = () =>
    setPagination({ pageIndex: pagination.pageIndex + 1, pageSize: pagination.pageSize })
  const goToPreviousPage = () =>
    setPagination({ pageIndex: pagination.pageIndex - 1, pageSize: pagination.pageSize })
  const setPageSize = (value: number) =>
    setPagination({ pageIndex: pagination.pageIndex, pageSize: value })

  return {
    totalPageCount,
    canPreviousPage,
    canNextPage,
    currentPageNumber,
    pageSize,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    setPageSize,
    changeSize,
    hideDropdown,
  }
}
