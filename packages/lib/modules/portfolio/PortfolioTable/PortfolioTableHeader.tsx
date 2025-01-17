import { Grid, GridItem, Icon, Text, VStack } from '@chakra-ui/react'
import { Globe } from 'react-feather'
import { SortableHeader, Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { PortfolioTableSortingId, PortfolioSortingData, portfolioOrderByFn } from './PortfolioTable'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

const setIsDesc = (id: PortfolioTableSortingId, currentSortingObj: PortfolioSortingData) =>
  currentSortingObj.id === id ? !currentSortingObj.desc : true

type Props = {
  currentSortingObj: PortfolioSortingData
  setCurrentSortingObj: (value: PortfolioSortingData) => void
}
export function PortfolioTableHeader({ currentSortingObj, setCurrentSortingObj, ...rest }: Props) {
  const portfolioOrderBy = portfolioOrderByFn(PROJECT_CONFIG.options.showVeBal)

  return (
    <Grid
      {...rest}
      borderBottom="1px solid"
      borderColor="border.base"
      p={['ms', 'md']}
      px="xs"
      w="full"
    >
      <GridItem>
        <VStack align="start" w="full">
          <Icon as={Globe} boxSize="5" color="font.primary" ml="1" />
        </VStack>
      </GridItem>
      <GridItem>
        <Text fontWeight="bold">Pool name</Text>
      </GridItem>
      <GridItem justifySelf="start">
        <Text fontWeight="bold" textAlign="left">
          Details
        </Text>
      </GridItem>
      {portfolioOrderBy.map((orderByItem, index) => (
        <SortableHeader
          align={index === 0 ? 'left' : 'right'}
          isSorted={orderByItem.id === currentSortingObj.id}
          key={orderByItem.id}
          label={orderByItem.title}
          onSort={() => {
            if (orderByItem.id === currentSortingObj.id) {
              setCurrentSortingObj({
                id: orderByItem.id,
                desc: setIsDesc(orderByItem.id, currentSortingObj),
              })
            } else {
              setCurrentSortingObj({ id: orderByItem.id, desc: false })
            }
          }}
          sorting={currentSortingObj.desc ? Sorting.desc : Sorting.asc}
        />
      ))}
    </Grid>
  )
}
