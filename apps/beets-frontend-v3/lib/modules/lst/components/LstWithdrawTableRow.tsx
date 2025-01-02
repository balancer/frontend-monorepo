import { Box, Button, Grid, GridItem, GridProps, HStack, Text } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { format } from 'date-fns'
import { useLst } from '../LstProvider'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { UserWithdraw } from '../hooks/useGetUserWithdraws'
import { formatUnits } from 'viem'
import { ApiToken } from '@repo/lib/modules/pool/pool.types'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useUserWithdraws } from '../hooks/useUserWithdraws'

interface Props extends GridProps {
  withdrawal: UserWithdraw
  keyValue: number
  token: ApiToken | undefined
  onOpen(): void
}

export function LstWithdrawTableRow({ withdrawal, keyValue, token, onOpen, ...rest }: Props) {
  const { withdrawDelay, setWithdrawId } = useLst()

  const requestTimestamp = Number(withdrawal.requestTimestamp) + withdrawDelay
  const now = new Date().getTime() / 1000

  const { withdrawId } = useUserWithdraws(keyValue)

  function onHandleClick() {
    setWithdrawId(withdrawId)
    onOpen()
  }

  return (
    <FadeInOnView>
      <Box
        _hover={{
          bg: 'background.level0',
        }}
        key={keyValue}
        px={{ base: '0', sm: 'md' }}
        rounded="md"
        transition="all 0.2s ease-in-out"
        w="full"
      >
        <Grid {...rest} pr="4" py={{ base: 'ms', md: 'md' }}>
          <GridItem>
            <HStack gap={['xs', 'sm']}>
              {token && (
                <TokenIcon
                  address={token.address}
                  alt={token.symbol}
                  chain={token.chain}
                  size={24}
                />
              )}
              <Text>{fNum('token', formatUnits(withdrawal.assetAmount, 18))}</Text>
            </HStack>
          </GridItem>
          <GridItem>{format(new Date(requestTimestamp * 1000), 'dd MMMM yyyy HH:mm')}</GridItem>
          <GridItem>
            {/* <Tooltip label={isDisabled ? disabledReason : ''}> */}
            <Button
              isDisabled={withdrawal.isWithdrawn || now < requestTimestamp}
              onClick={onHandleClick}
              size="xxs"
              variant="primary"
              w="full"
            >
              {withdrawal.isWithdrawn ? 'Withdrawn' : 'Withdraw'}
            </Button>
            {/* </Tooltip> */}
          </GridItem>
        </Grid>
      </Box>
    </FadeInOnView>
  )
}
