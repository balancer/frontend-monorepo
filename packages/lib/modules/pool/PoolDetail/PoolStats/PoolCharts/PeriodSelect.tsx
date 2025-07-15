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

  const customChakraStyles: typeof chakraStyles = {
    ...chakraStyles,
    option: (provided, state) => ({
      ...chakraStyles.option?.(provided, state),
      ...(state.isSelected && {
        color: 'font.highlight',
      }),
    }),
  }

  function handleChange(newOption: SingleValue<PeriodOption>) {
    if (newOption) onChange(newOption)
  }

  return (
    <Select<PeriodOption, false, GroupBase<PeriodOption>>
      chakraStyles={customChakraStyles}
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
