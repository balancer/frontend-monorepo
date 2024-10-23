import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@chakra-ui/icons'
import {
  HStack,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Text,
  Center,
  Grid,
  GridItem,
} from '@chakra-ui/react'

interface Props {
  goToFirstPage: () => void
  goToLastPage: () => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  canPreviousPage: boolean
  canNextPage: boolean
  currentPageNumber: number
  totalPageCount: number
  setPageIndex: (page: number) => void
  setPageSize: (page: number) => void
  pageSize: number
  changeSize?: boolean
  isSmall?: boolean
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
  setPageIndex,
  setPageSize,
  pageSize,
  changeSize = true,
  isSmall = false, // set to true when table is NOT directly used in a card
  ...rest
}: Props) {
  return (
    <Center w={{ base: isSmall ? '90vw' : '95vw', lg: 'full' }} {...rest}>
      <Grid
        gap={{ base: '2', lg: '4' }}
        mt={{ base: '4', lg: '8' }}
        templateAreas={{
          base: `"left page right"
                 "goto goto size"`,
          lg: `"left goto page size right"`,
        }}
        templateColumns={{
          base: '2fr repeat(2, 1fr)',
          lg: 'repeat(5, 1fr)',
        }}
        w={{ base: 'full', lg: '75%' }}
      >
        <GridItem area="left" justifySelf={{ base: 'start', lg: 'end' }}>
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
        </GridItem>
        <GridItem alignSelf="center" area="page">
          <Center>
            <Text color="grayText" flexShrink="0" fontSize="sm" mr="8">
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
        </GridItem>
        <GridItem area="goto" justifySelf={{ base: 'start', lg: 'end' }}>
          <HStack alignContent="space-between">
            <Text color="grayText" flexShrink="0" fontSize="sm">
              Go to page:
            </Text>{' '}
            <NumberInput
              defaultValue={currentPageNumber}
              max={totalPageCount}
              min={1}
              ml="2"
              onChange={value => {
                const page = value ? parseInt(value) - 1 : 0
                setPageIndex(page)
              }}
              size="sm"
              w="28"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
        </GridItem>
        <GridItem area="size">
          <Select
            disabled={!changeSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
            }}
            size="sm"
            value={pageSize}
            w="32"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {`Show ${pageSize}`}
              </option>
            ))}
          </Select>
        </GridItem>
        <GridItem area="right" justifySelf={{ base: 'end', lg: 'start' }}>
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
        </GridItem>
      </Grid>
    </Center>
  )
}
