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
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'

export function AddLiquidityFormCheckbox() {
  const { tokens, acceptPoolRisks, setAcceptPoolRisks } = useAddLiquidity()
  const { balanceFor, isBalancesLoading } = useTokenBalances()

  const hasNoPoolTokensInWallet = tokens.every(
    token => token && balanceFor(token.address)?.formatted === '0'
  )

  return (
    <HStack spacing="xs">
      <Checkbox
        isChecked={acceptPoolRisks}
        isDisabled={isBalancesLoading || hasNoPoolTokensInWallet}
        onChange={e => setAcceptPoolRisks(e.target.checked)}
        size="lg"
      >
        <Text fontSize="md">I accept the risks of interacting with this pool</Text>
      </Checkbox>
      <Popover placement="top" trigger="hover">
        <PopoverTrigger>
          <IconButton
            _hover={{ bg: 'background.level2' }}
            aria-label="pool-risks-info"
            bg="background.level2"
            icon={<InfoIcon />}
            size="xs"
          />
        </PopoverTrigger>
        <Box shadow="2xl" zIndex="popover">
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
