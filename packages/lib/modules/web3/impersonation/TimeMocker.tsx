import { Button, HStack } from '@chakra-ui/react'
import { queryClient } from '@repo/lib/shared/app/react-query.provider'
import { addDays } from 'date-fns'
import MockDate from 'mockdate'

type Props = {
  setIsFakeTime: (isFakeTime: boolean) => void
}
function TimeMocker({ setIsFakeTime }: Props) {
  const mockTime = (daysOffset: number) => {
    setIsFakeTime(true)
    MockDate.set(new Date(addDays(Date.now(), daysOffset)))
    queryClient.invalidateQueries()
  }

  const resetTime = () => {
    MockDate.reset()
    queryClient.invalidateQueries()
    setIsFakeTime(false)
  }

  return (
    <HStack>
      <Button onClick={() => mockTime(1)}>+1 day</Button>
      <Button onClick={() => mockTime(-1)}>-1 day</Button>
      <Button onClick={resetTime}>Reset time</Button>
    </HStack>
  )
}

export default TimeMocker
