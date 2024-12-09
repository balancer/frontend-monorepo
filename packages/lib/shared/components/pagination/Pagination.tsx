import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@chakra-ui/icons'
import { HStack, IconButton, Select, Text, Center, Stack } from '@chakra-ui/react'

interface Props {
  goToFirstPage: () => void
  goToLastPage: () => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  canPreviousPage: boolean
  canNextPage: boolean
  currentPageNumber: number
  totalPageCount: number
  setPageSize: (page: number) => void
  pageSize: number
  changeSize?: boolean
  isSmall?: boolean
  hideDropdown?: boolean
}

export function Pagination({
  goToFirstPage,
  goToLastPage,
  goToNextPage,
  goToPreviousPage,
  canPreviousPage,
  canNextPage,
  currentPageNumber,
  totalPageCount,
  setPageSize,
  pageSize,
  changeSize = true,
  isSmall = false, // set to true when table is NOT directly used in a card
  hideDropdown = false,
  ...rest
}: Props) {
  return (
    <Stack
      direction={{ base: 'column', lg: 'row' }}
      justify={hideDropdown ? 'center' : 'space-between'}
      w="full"
      {...rest}
    >
      <HStack>
        <IconButton
          aria-label="first page"
          icon={<ArrowLeftIcon h="3" w="3" />}
          isDisabled={!canPreviousPage}
          mr="2"
          onClick={goToFirstPage}
          size="sm"
        />

        <IconButton
          aria-label="previous page"
          icon={<ChevronLeftIcon h="6" w="6" />}
          isDisabled={!canPreviousPage}
          onClick={goToPreviousPage}
          size="sm"
        />
        <Center>
          <Text color="grayText" flexShrink="0" fontSize="sm">
            Page{' '}
            <Text as="span" color="grayText" fontWeight="bold">
              {currentPageNumber}
            </Text>{' '}
            of{' '}
            <Text as="span" color="grayText" fontWeight="bold">
              {totalPageCount}
            </Text>
          </Text>
        </Center>
        <IconButton
          aria-label="next page"
          icon={<ChevronRightIcon h="6" w="6" />}
          isDisabled={!canNextPage}
          onClick={goToNextPage}
          size="sm"
        />
        <IconButton
          aria-label="last page"
          icon={<ArrowRightIcon h="3" w="3" />}
          isDisabled={!canNextPage}
          ml="2"
          onClick={goToLastPage}
          size="sm"
        />
      </HStack>
      {!hideDropdown && (
        <Select
          disabled={!changeSize}
          onChange={e => {
            setPageSize(Number(e.target.value))
          }}
          size="sm"
          value={pageSize}
          variant="tertiary"
          w="32"
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              {`Show ${pageSize}`}
            </option>
          ))}
        </Select>
      )}
    </Stack>
  )
}
