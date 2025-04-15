import { Button, HStack } from '@chakra-ui/react'
import { queryClient } from '@repo/lib/shared/app/react-query.provider'
import { addDays } from 'date-fns'
import MockDate from 'mockdate'
import { useImpersonateAccount } from './useImpersonateAccount'

type Props = {
  setIsFakeTime: (isFakeTime: boolean) => void
}
function TimeMocker({ setIsFakeTime }: Props) {
  const { mineBlockWithTimestamp, reset } = useImpersonateAccount()
  const mockTime = async (daysOffset: number) => {
    setIsFakeTime(true)
    const fakeDate = new Date(addDays(Date.now(), daysOffset))
    MockDate.set(fakeDate)
    const fakeDateInSeconds = BigInt(Math.floor(fakeDate.getTime() / 1000))
    await mineBlockWithTimestamp(fakeDateInSeconds)
    queryClient.invalidateQueries()
  }

  const resetTime = () => {
    MockDate.reset()
    setIsFakeTime(false)
    // Anvil fork reset required as we cannot mine blocks with timestamps back in time
    reset()
  }

  return (
    <HStack>
      <Button onClick={() => mockTime(1)}>+1 day</Button>
      <Button onClick={() => mockTime(5)}>+5 days</Button>
      <Button onClick={() => resetTime()}>Reset time</Button>
    </HStack>
  )
}

export default TimeMocker
