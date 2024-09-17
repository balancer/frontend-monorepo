import { Grid, GridItem, Icon, Text, VStack } from '@chakra-ui/react'

import { Globe } from 'react-feather'
import { SortableHeader } from '@/lib/shared/components/tables/SortableHeader'
import { PortfolioTableSortingId, PortfolioSortingData, portfolioOrderBy } from './PortfolioTable'

const setIsDesc = (id: PortfolioTableSortingId, currentSortingObj: PortfolioSortingData) =>
  currentSortingObj.id === id ? !currentSortingObj.desc : true

type Props = {
  currentSortingObj: PortfolioSortingData
  setCurrentSortingObj: (value: PortfolioSortingData) => void
}
export function PortfolioTableHeader({ currentSortingObj, setCurrentSortingObj, ...rest }: Props) {
  return (
    <Grid
      {...rest}
      p={['ms', 'md']}
      px="xs"
      w="full"
      borderBottom="1px solid"
      borderColor="border.base"
    >
      <GridItem>
        <VStack align="start" w="full">
          <Icon as={Globe} boxSize="5" ml="1" color="font.primary" />
        </VStack>
      </GridItem>
      <GridItem>
        <Text fontWeight="bold">Pool name</Text>
      </GridItem>
      <GridItem justifySelf="start">
        <Text fontWeight="bold" textAlign="left">
          Type
        </Text>
      </GridItem>
      {portfolioOrderBy.map((orderByItem, index) => (
        <SortableHeader
          key={index}
          label={orderByItem.title}
          isSorted={orderByItem.id === currentSortingObj.id}
          sorting={currentSortingObj.desc ? 'desc' : 'asc'}
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
          align={index === 0 ? 'left' : 'right'}
        />
      ))}
    </Grid>
  )
}
