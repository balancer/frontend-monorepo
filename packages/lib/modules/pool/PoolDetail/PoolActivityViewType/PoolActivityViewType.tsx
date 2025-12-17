'use client'

import { PoolActivityView, usePoolActivityViewType } from './usePoolActivityViewType'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { ChartBubbleIcon } from '@repo/lib/shared/components/icons/ChartBubbleIcon'
import { TableIcon } from '@repo/lib/shared/components/icons/TableIcon'

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

  function changeListView(option: ButtonGroupOption) {
    setPoolActivityView(option.value as PoolActivityView)
  }

  const currentOption = isChartView ? options[0] : options[1]

  return (
    <ButtonGroup
      currentOption={currentOption}
      groupId="pool-chart-view"
      onChange={changeListView}
      options={options}
      size="xxs"
    />
  )
}
