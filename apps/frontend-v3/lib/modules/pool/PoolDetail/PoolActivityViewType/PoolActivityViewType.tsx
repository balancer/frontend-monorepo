'use client'

import { PoolActivityView, usePoolActivityViewType } from './usePoolActivityViewType'
import ButtonGroup, {
  ButtonGroupOption,
} from '@/lib/shared/components/btns/button-group/ButtonGroup'
import { useEffect, useState } from 'react'
import { ChartBubbleIcon } from '@/lib/shared/components/icons/ChartBubbleIcon'
import { TableIcon } from '@/lib/shared/components/icons/TableIcon'

const options: ButtonGroupOption[] = [
  {
    value: PoolActivityView.Chart,
    label: <ChartBubbleIcon size={16} />,
  },
  {
    value: PoolActivityView.List,
    label: <TableIcon />,
  },
]

export function PoolActivityViewType() {
  const { setPoolActivityView, isChartView } = usePoolActivityViewType()
  const [currentOption, setCurrentOption] = useState<ButtonGroupOption>(options[0])

  function changeListView(option: ButtonGroupOption) {
    setPoolActivityView(option.value as PoolActivityView)
  }

  useEffect(() => {
    const newOption = isChartView ? options[0] : options[1]
    setCurrentOption(newOption)
  }, [isChartView])

  return (
    <ButtonGroup
      size="xxs"
      currentOption={currentOption}
      options={options}
      onChange={changeListView}
      groupId="pool-chart-view"
    />
  )
}
