import {
  HStack,
  IconButton,
  NativeSelect,
  Text,
  Center,
  Stack,
  JsxStyleProps,
  Icon } from '@chakra-ui/react';
import { LuArrowLeft, LuArrowRight, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export interface PaginationProps {
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
  hideDropdown = false,
  ...rest
}: PaginationProps & JsxStyleProps) {
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
          disabled={!canPreviousPage}
          mr="2"
          onClick={goToFirstPage}
          size="sm"><Icon h="3" w="3" asChild><LuArrowLeft /></Icon></IconButton>

        <IconButton
          aria-label="previous page"
          disabled={!canPreviousPage}
          onClick={goToPreviousPage}
          size="sm"><Icon h="6" w="6" asChild><LuChevronLeft /></Icon></IconButton>
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
          disabled={!canNextPage}
          onClick={goToNextPage}
          size="sm"><Icon h="6" w="6" asChild><LuChevronRight /></Icon></IconButton>
        <IconButton
          aria-label="last page"
          disabled={!canNextPage}
          ml="2"
          onClick={goToLastPage}
          size="sm"><Icon h="3" w="3" asChild><LuArrowRight /></Icon></IconButton>
      </HStack>
      {!hideDropdown && (
        <NativeSelect.Root>
          <NativeSelect.Field
            disabled={!changeSize}
            onValueChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setPageSize(Number(e.target.value))
            }}
            size="sm"
            value={String(pageSize)}
            variant="tertiary"
            w="32">
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {`Show ${pageSize}`}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      )}
    </Stack>
  );
}
