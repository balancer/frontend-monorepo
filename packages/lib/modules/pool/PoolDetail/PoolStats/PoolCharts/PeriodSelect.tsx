import { getSelectStyles } from '@repo/lib/shared/services/chakra/custom/chakra-react-select'
import { SingleValue, GroupBase, OptionBase, Select } from 'chakra-react-select'
import { PoolChartPeriod, poolChartPeriods, usePoolCharts } from './PoolChartsProvider'

type PeriodOption = PoolChartPeriod & OptionBase

type Props = {
  value: PeriodOption
  onChange(value: PeriodOption): void
}

function PeriodSelectContainer({ value, onChange }: Props) {
  const chakraStyles = getSelectStyles<PeriodOption>()

  function handleChange(newOption: SingleValue<PeriodOption>) {
    if (newOption) onChange(newOption)
  }

  return (
    <Select<PeriodOption, false, GroupBase<PeriodOption>>
      chakraStyles={chakraStyles}
      name="Chain"
      onChange={handleChange}
      options={poolChartPeriods}
      size="sm"
      value={value}
    />
  )
}

export function PeriodSelect() {
  const { activePeriod, setActivePeriod } = usePoolCharts()

  return <PeriodSelectContainer onChange={setActivePeriod} value={activePeriod} />
}
