import { Box, HStack, Skeleton, Text } from '@chakra-ui/react'
import networkConfigs from '@repo/lib/config/networks'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { GetStakedSonicDataQuery, GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { Address } from 'viem'

const CHAIN = GqlChain.Sonic

function LstStatRow({
  label,
  value,
  secondaryValue,
  isLoading,
}: {
  label: string
  value: string
  secondaryValue?: string
  isLoading?: boolean
}) {
  return (
    <HStack align="flex-start" justify="space-between" w="full">
      <Text color="font.secondary">{label}</Text>
      <Box alignItems="flex-end" display="flex" flexDirection="column">
        {isLoading ? <Skeleton h="full" w="12" /> : <Text fontWeight="bold">{value}</Text>}
        {isLoading ? (
          <Skeleton h="full" w="12" />
        ) : (
          <Text color="grayText" fontSize="sm">
            {secondaryValue}
          </Text>
        )}
      </Box>
    </HStack>
  )
}

export function LstInfoStats({
  stakedSonicData,
  isStakedSonicDataLoading,
}: {
  stakedSonicData?: GetStakedSonicDataQuery
  isStakedSonicDataLoading: boolean
}) {
  const lstAddress = (networkConfigs[CHAIN].contracts.beets?.lstStakingProxy || '') as Address
  const { getToken, usdValueForToken } = useTokens()
  const lstToken = getToken(lstAddress, CHAIN)
  const { toCurrency } = useCurrency()
  const assetsToSharesRate = stakedSonicData?.stsGetGqlStakedSonicData.exchangeRate || '1.0'
  const sharesToAssetsRate = bn(1).div(bn(assetsToSharesRate))

  return (
    <>
      <LstStatRow
        isLoading={isStakedSonicDataLoading}
        label="Total ($S)"
        secondaryValue={toCurrency(
          usdValueForToken(lstToken, stakedSonicData?.stsGetGqlStakedSonicData.totalAssets || '0')
        )}
        value={fNum('token', stakedSonicData?.stsGetGqlStakedSonicData.totalAssets || '0')}
      />
      <LstStatRow
        isLoading={isStakedSonicDataLoading}
        label="Delegated ($S)"
        secondaryValue={toCurrency(
          usdValueForToken(
            lstToken,
            stakedSonicData?.stsGetGqlStakedSonicData.totalAssetsDelegated || '0'
          )
        )}
        value={fNum('token', stakedSonicData?.stsGetGqlStakedSonicData.totalAssetsDelegated || '0')}
      />
      <LstStatRow
        isLoading={isStakedSonicDataLoading}
        label="Pending delegation ($S)"
        secondaryValue={toCurrency(
          usdValueForToken(
            lstToken,
            stakedSonicData?.stsGetGqlStakedSonicData.totalAssetsPool || '0'
          )
        )}
        value={fNum('token', stakedSonicData?.stsGetGqlStakedSonicData.totalAssetsPool || '0')}
      />
      <LstStatRow
        isLoading={isStakedSonicDataLoading}
        label="stS rate"
        secondaryValue={`1 S = ${fNum('token', sharesToAssetsRate)} stS`}
        value={`1 stS = ${fNum('token', assetsToSharesRate)} S`}
      />
    </>
  )
}
