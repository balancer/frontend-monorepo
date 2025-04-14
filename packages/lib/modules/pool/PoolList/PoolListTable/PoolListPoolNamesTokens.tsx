import { PoolDisplayType } from '../../pool.types'
import { usePoolList } from '../PoolListProvider'
import { useState, useCallback, memo, useMemo } from 'react'
import ButtonGroupComponent, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { Box } from '@chakra-ui/react'

const OPTIONS = [
  { value: PoolDisplayType.Name, label: 'Pool name' },
  { value: PoolDisplayType.TokenPills, label: 'Pool tokens' },
]

function PoolListPoolNamesTokensComponent() {
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

export const PoolListPoolNamesTokens = memo(PoolListPoolNamesTokensComponent)
