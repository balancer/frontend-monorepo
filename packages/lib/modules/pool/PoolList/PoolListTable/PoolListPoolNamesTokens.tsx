import { PoolDisplayType } from '../../pool.types'
import { useState, useCallback, useMemo } from 'react'
import ButtonGroupComponent, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { Box } from '@chakra-ui/react'
import { usePoolList } from '../PoolListProvider'

const OPTIONS = [
  { value: PoolDisplayType.Name, label: 'Pool name' },
  { value: PoolDisplayType.TokenPills, label: 'Pool tokens' },
]

export function PoolListPoolNamesTokens() {
  const { poolDisplayType, setPoolDisplayType } = usePoolList()

  const initialOption = useMemo(
    () => OPTIONS.find(opt => opt.value === poolDisplayType) || OPTIONS[0],
    [poolDisplayType]
  )

  const [option, setOption] = useState<ButtonGroupOption>(initialOption)

  const handleOptionChange = useCallback(
    (selectedOption: ButtonGroupOption) => {
      setOption(selectedOption)
      setPoolDisplayType(selectedOption.value as PoolDisplayType)
    },
    [setPoolDisplayType]
  )

  return (
    <Box w="fit-content">
      <ButtonGroupComponent
        currentOption={option}
        groupId="pool-display-type"
        isGray
        onChange={handleOptionChange}
        options={OPTIONS}
        size="xxs"
      />
    </Box>
  )
}
