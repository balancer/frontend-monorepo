import {
  Checkbox,
  HStack,
  Popover,
  PopoverTrigger,
  IconButton,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Box,
  Text,
} from '@chakra-ui/react'
import { RisksList } from '../../../PoolDetail/PoolInfo/PoolRisks/PoolRisks'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { useTokenBalances } from '@/lib/modules/tokens/TokenBalancesProvider'
import { InfoIcon } from '@/lib/shared/components/icons/InfoIcon'

export function AddLiquidityFormCheckbox() {
  const { tokens, acceptPoolRisks, setAcceptPoolRisks } = useAddLiquidity()
  const { balanceFor, isBalancesLoading } = useTokenBalances()

  const hasNoPoolTokensInWallet = tokens.every(
    token => token && balanceFor(token.address)?.formatted === '0'
  )

  return (
    <HStack spacing="xs">
      <Checkbox
        size="lg"
        isChecked={acceptPoolRisks}
        onChange={e => setAcceptPoolRisks(e.target.checked)}
        isDisabled={isBalancesLoading || hasNoPoolTokensInWallet}
      >
        <Text fontSize="md">I accept the risks of interacting with this pool</Text>
      </Checkbox>
      <Popover placement="top" trigger="hover">
        <PopoverTrigger>
          <IconButton
            size="xs"
            aria-label="pool-risks-info"
            bg="background.level2"
            _hover={{ bg: 'background.level2' }}
            icon={<InfoIcon />}
          />
        </PopoverTrigger>
        <Box zIndex="popover" shadow="2xl">
          <PopoverContent>
            <PopoverArrow bg="background.level3" />
            <PopoverBody>
              <RisksList textVariant="primary" />
            </PopoverBody>
          </PopoverContent>
        </Box>
      </Popover>
    </HStack>
  )
}
