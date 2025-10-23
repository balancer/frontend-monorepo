import { useReactiveVar } from '@apollo/client'
import { withdrawStateVar } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState'
import { useQuery } from '@tanstack/react-query'
import numeral from 'numeral'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'

export function useReliquaryExitGetBptInForSingleAssetWithdraw() {
  const networkConfig = useNetworkConfig()
  const { poolService } = usePool()
  const { singleAsset } = useReactiveVar(withdrawStateVar)

  const query = useQuery({
    queryKey: ['exitGetBptInForSingleAssetWithdraw', singleAsset],
    queryFn: async () => {
      if (!singleAsset || singleAsset.amount === '' || parseFloat(singleAsset.amount) === 0) {
        return {
          bptIn: '0',
          priceImpact: 0,
        }
      }

      return poolService.exitGetBptInForSingleAssetWithdraw(singleAsset)
    },
    enabled: !!singleAsset,
  })

  const bptOutAndPriceImpact = query.data
  const priceImpact = Math.abs(bptOutAndPriceImpact?.priceImpact || 0)
  const hasHighPriceImpact = priceImpact > networkConfig.priceImpact.withdraw.high
  const hasMediumPriceImpact =
    !hasHighPriceImpact && priceImpact > networkConfig.priceImpact.withdraw.noticeable

  const formattedPriceImpact = numeral(priceImpact > 0.000001 ? priceImpact : 0).format('0.00%')

  return { ...query, hasHighPriceImpact, hasMediumPriceImpact, formattedPriceImpact }
}
