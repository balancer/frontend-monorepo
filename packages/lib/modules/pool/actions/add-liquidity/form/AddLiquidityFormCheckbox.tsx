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
import { TextShine } from '@repo/lib/shared/components/TextShine/TextShine'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

export function AddLiquidityFormCheckbox() {
  const { tokens, acceptPoolRisks, setAcceptPoolRisks } = useAddLiquidity()
  const { balanceFor, isBalancesLoading } = useTokenBalances()

  const hasNoPoolTokensInWallet = tokens.every(
    token => token && balanceFor(token.address)?.formatted === '0'
  )

  return (
    <FadeInOnView scaleUp={false}>
      <HStack spacing="xs">
        <Checkbox
          isChecked={acceptPoolRisks}
          isDisabled={isBalancesLoading || hasNoPoolTokensInWallet}
          onChange={e => setAcceptPoolRisks(e.target.checked)}
          size="lg"
        >
          <Text as="div" fontSize="md" lineHeight="1" sx={{ textWrap: 'pretty' }}>
            <TextShine animationDuration="1.5s">
              I accept the risks of interacting with this pool
            </TextShine>
            <Box as="span">
              <Popover placement="top" trigger="hover">
                <PopoverTrigger>
                  <IconButton
                    _hover={{ bg: 'background.level2', opacity: '1' }}
                    aria-label="pool-risks-info"
                    bg="background.level2"
                    icon={<InfoIcon />}
                    left="1px"
                    opacity="0.6"
                    position="relative"
                    size="xs"
                    top="-1px"
                    transition="opacity 0.2s var(--ease-out-cubic)"
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
            </Box>
          </Text>
        </Checkbox>
      </HStack>
    </FadeInOnView>
  )
}
