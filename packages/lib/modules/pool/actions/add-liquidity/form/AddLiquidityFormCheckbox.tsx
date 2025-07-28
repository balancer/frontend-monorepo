import {
  Checkbox,
  HStack,
  VStack,
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
      <VStack align="start" spacing="sm">
        <HStack spacing="xs">
          <Checkbox
            isChecked={hasAcceptedPoolRisks}
            isDisabled={isBalancesLoading || hasNoPoolTokensInWallet}
            onChange={e => setHasAcceptedPoolRisks(e.target.checked)}
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
        {isBoostedPool && (
          <HStack spacing="xs">
            <Checkbox
              alignItems="flex-start"
              isChecked={hasAcceptedBoostedRisks}
              isDisabled={isBalancesLoading || hasNoPoolTokensInWallet}
              onChange={e => setHasAcceptedBoostedRisks(e.target.checked)}
              size="lg"
            >
              <Text as="div" fontSize="md" lineHeight="1" sx={{ textWrap: 'pretty' }}>
                <TextShine animationDuration="1.5s">{boostedRiskDescription}</TextShine>
              </Text>
            </Checkbox>
          </HStack>
        )}
      </VStack>
    </FadeInOnView>
  )
}
