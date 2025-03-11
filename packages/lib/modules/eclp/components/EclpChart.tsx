import { Button, Icon } from '@chakra-ui/react'
import { Repeat } from 'react-feather'
import { useEclpChart } from '../hooks/useEclpChart'
import ReactECharts from 'echarts-for-react'

export function EclpChart() {
  const { options, toggleIsReversed } = useEclpChart()

  return (
    <>
      <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
      <Button
        bottom={0}
        fontSize="xs"
        fontWeight="medium"
        onClick={toggleIsReversed}
        position="absolute"
        px={2}
        py={1}
        right={2}
        size="xs"
        variant="primary"
        zIndex={1}
      >
        <Icon as={Repeat} />
      </Button>
    </>
  )
}
