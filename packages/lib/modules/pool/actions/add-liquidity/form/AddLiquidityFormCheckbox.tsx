import { Checkbox, HStack, VStack, Popover, HoverCard, IconButton, Box, Text } from '@chakra-ui/react';
import { RisksList } from '../../../PoolDetail/PoolInfo/PoolRisks/PoolRisks'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { TextShine } from '@repo/lib/shared/components/TextShine/TextShine'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useState, useEffect } from 'react'
import { usePool } from '../../../PoolProvider'
import { isBoosted } from '../../../pool.helpers'
import { usePoolsMetadata } from '../../../metadata/PoolsMetadataProvider'

export function AddLiquidityFormCheckbox() {
  const [hasAcceptedPoolRisks, setHasAcceptedPoolRisks] = useState(false)
  const [hasAcceptedBoostedRisks, setHasAcceptedBoostedRisks] = useState(false)

  const { tokens, setAcceptPoolRisks } = useAddLiquidity()
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const hasNoPoolTokensInWallet = tokens.every(
    token => token && balanceFor(token.address)?.formatted === '0'
  )

  const { pool } = usePool()
  const isBoostedPool = isBoosted(pool)
  const { getErc4626Metadata } = usePoolsMetadata()
  const erc4626Metadata = getErc4626Metadata(pool)
  const protocolNames = erc4626Metadata.map(metadata => metadata.name.split(' ')[0])
  const numberOfProtocols = protocolNames.length

  let dynamicProtocolString
  if (numberOfProtocols === 1) {
    dynamicProtocolString = `${protocolNames[0]}—an unaffiliated third party. If ${protocolNames[0]} is`
  } else if (numberOfProtocols === 2) {
    dynamicProtocolString = `${protocolNames[0]} and ${protocolNames[1]}—unaffiliated third parties. If any of these parties are`
  } else if (numberOfProtocols > 2) {
    const allButLast = protocolNames.slice(0, -1).join(', ')
    const last = protocolNames[protocolNames.length - 1]
    dynamicProtocolString = `${allButLast}, and ${last}—unaffiliated third parties. If any of these are`
  }
  const boostedRiskDescription = `I accept that by adding tokens to this Boosted Pool, my tokens are deposited into ${dynamicProtocolString} compromised, I may lose all my tokens in this pool.`

  useEffect(() => {
    if (isBoostedPool) {
      setAcceptPoolRisks(hasAcceptedPoolRisks && hasAcceptedBoostedRisks)
    } else {
      setAcceptPoolRisks(hasAcceptedPoolRisks)
    }
  }, [hasAcceptedPoolRisks, hasAcceptedBoostedRisks, setAcceptPoolRisks, isBoostedPool])

  return (
    <FadeInOnView scaleUp={false}>
      <VStack align="start" gap="sm">
        <HStack gap="xs">
          <Checkbox.Root
            disabled={isBalancesLoading || hasNoPoolTokensInWallet}
            onCheckedChange={e => setHasAcceptedPoolRisks(e.target.checked)}
            size="lg"
            checked={hasAcceptedPoolRisks}
          ><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root></Checkbox.Label></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label>
              <Text as="div" fontSize="md" lineHeight="1" css={{
                textWrap: 'pretty'
              }}>
                <TextShine animationDuration="1.5s">
                  I accept the risks of interacting with this pool
                </TextShine>
                <Box as="span">
                  <HoverCard.Root
                    positioning={{
                      placement: 'top'
                    }}>
                    <HoverCard.Trigger asChild>
                      <IconButton
                        _hover={{ bg: 'background.level2', opacity: '1' }}
                        aria-label="pool-risks-info"
                        bg="background.level2"
                        left="1px"
                        opacity="0.6"
                        position="relative"
                        size="xs"
                        top="-1px"
                        transition="opacity 0.2s var(--ease-out-cubic)"><InfoIcon /></IconButton>
                    </HoverCard.Trigger>
                    <Box shadow="2xl" zIndex="popover">
                      <HoverCard.Positioner>
                        <HoverCard.Content>
                          <HoverCard.Arrow bg="background.level3" />
                          <HoverCard.Body>
                            <RisksList textVariant="primary" />
                          </HoverCard.Body>
                        </HoverCard.Content>
                      </HoverCard.Positioner>
                    </Box>
                  </HoverCard.Root>
                </Box>
              </Text>
            </Checkbox.Label></Checkbox.Root></Checkbox.Label></Checkbox.Root>
        </HStack>
        {isBoostedPool && (
          <HStack gap="xs">
            <Checkbox.Root
              alignItems="flex-start"
              disabled={isBalancesLoading || hasNoPoolTokensInWallet}
              onCheckedChange={e => setHasAcceptedBoostedRisks(e.target.checked)}
              size="lg"
              checked={hasAcceptedBoostedRisks}
            ><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root></Checkbox.Label></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label>
                <Text as="div" fontSize="md" lineHeight="1" css={{
                  textWrap: 'pretty'
                }}>
                  <TextShine animationDuration="1.5s">{boostedRiskDescription}</TextShine>
                </Text>
              </Checkbox.Label></Checkbox.Root></Checkbox.Label></Checkbox.Root>
          </HStack>
        )}
      </VStack>
    </FadeInOnView>
  );
}
