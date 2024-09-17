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
        w={{ base: 'full', lg: '75%' }}
        mt={{ base: '4', lg: '8' }}
        templateColumns={{
          base: '2fr repeat(2, 1fr)',
          lg: 'repeat(5, 1fr)',
        }}
        templateAreas={{
          base: `"left page right"
                 "goto goto size"`,
          lg: `"left goto page size right"`,
        }}
        gap={{ base: '2', lg: '4' }}
      >
        <GridItem area="left" justifySelf={{ base: 'start', lg: 'end' }}>
          <IconButton
            aria-label="first page"
            onClick={goToFirstPage}
            isDisabled={!canPreviousPage}
            icon={<ArrowLeftIcon h="3" w="3" />}
            mr="2"
            size="sm"
          />

          <IconButton
            aria-label="previous page"
            onClick={goToPreviousPage}
            isDisabled={!canPreviousPage}
            icon={<ChevronLeftIcon h="6" w="6" />}
            size="sm"
          />
        </GridItem>
        <GridItem area="page" alignSelf="center">
          <Center>
            <Text flexShrink="0" mr="8" fontSize="sm" color="grayText">
              Page{' '}
              <Text fontWeight="bold" as="span" color="grayText">
                {currentPageNumber}
              </Text>{' '}
              of{' '}
              <Text fontWeight="bold" as="span" color="grayText">
                {totalPageCount}
              </Text>
            </Text>
          </Center>
        </GridItem>
        <GridItem area="goto" justifySelf={{ base: 'start', lg: 'end' }}>
          <HStack alignContent="space-between">
            <Text flexShrink="0" color="grayText" fontSize="sm">
              Go to page:
            </Text>{' '}
            <NumberInput
              ml="2"
              w="28"
              min={1}
              max={totalPageCount}
              onChange={value => {
                const page = value ? parseInt(value) - 1 : 0
                setPageIndex(page)
              }}
              defaultValue={currentPageNumber}
              size="sm"
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
            w="32"
            value={pageSize}
            size="sm"
            onChange={e => {
              setPageSize(Number(e.target.value))
            }}
            disabled={!changeSize}
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
            onClick={goToNextPage}
            isDisabled={!canNextPage}
            size="sm"
            icon={<ChevronRightIcon h="6" w="6" />}
          />
          <IconButton
            aria-label="last page"
            onClick={goToLastPage}
            isDisabled={!canNextPage}
            size="sm"
            icon={<ArrowRightIcon h="3" w="3" />}
            ml="2"
          />
        </GridItem>
      </Grid>
    </Center>
  )
}
