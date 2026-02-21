import { Path } from '@balancer/sdk'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useRoutesChart } from './useRoutesChart'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

type Props = {
  paths: Path[] | undefined
  chain: GqlChain
}

export function RoutesCard({ paths, chain }: Props) {
  const { chartData, onChartReady } = useRoutesChart(paths, chain)

  // FIXME: [JUANJO] Hide in case of single pool swap???
  if (!paths || paths.length === 0) return null

  const maxHops = paths?.reduce((acc, path) => {
    return acc + path.pools.length
  }, 0)

  return (
    <Box w="full">
      <Accordion allowToggle variant="button" w="full">
        <AccordionItem
          bg="background.level3"
          border="1px solid"
          borderColor="transparent"
          borderRadius="md"
          shadow="md"
          w="full"
        >
          <AccordionButton pl="ms" pr="sm">
            <Box as="span" flex="1" textAlign="left">
              {`Proposed route: ${paths?.length} split(s), ${maxHops} hops`}
            </Box>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel h="200">
            <ReactECharts
              onChartReady={onChartReady}
              option={chartData}
              style={{ height: '100%', width: '100%' }}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
}
