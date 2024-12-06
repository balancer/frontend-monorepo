'use client'

import { useMemo } from 'react'
import { usePool } from '../../../PoolProvider'
import { format } from 'date-fns'
import { zeroAddress } from 'viem'
import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { isBoosted, isCowAmmPool, isStable, isV2Pool, isV3Pool } from '../../../pool.helpers'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { getPoolTypeLabel, shouldHideSwapFee } from '../../../pool.utils'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { getProjectConfig } from '@repo/lib/config/getProjectConfig'

export function useFormattedPoolAttributes() {
  const { pool } = usePool()
  const { toCurrency } = useCurrency()
  const { usdValueForBpt } = useTokens()

  const { delegateOwner } = getProjectConfig()
  const isV2 = isV2Pool(pool)
  const isV3 = isV3Pool(pool)

  const poolOwnerData = useMemo(() => {
    if (!pool) return
    const { owner, swapFeeManager } = pool
    if (!owner) return

    if ((owner === zeroAddress && isV2) || isCowAmmPool(pool.type)) {
      return {
        title: 'No owner',
        link: '',
        editableText: 'non-editable',
        attributeImmutabilityText: '',
      }
    }

    if (owner === delegateOwner || (owner === zeroAddress && isV3)) {
      return {
        title: `Delegate ${isV2 ? 'owner' : 'manager'}`,
        link: '',
        editableText: 'editable by governance',
        attributeImmutabilityText: isStable(pool.type)
          ? ' except for swap fees and AMP factor editable by governance'
          : ' except for swap fees editable by governance',
      }
    }

    const editableBy = `editable by ${isV2 ? 'pool owner' : 'swap fee manager'}`

    return {
      title: abbreviateAddress((isV2 ? owner : swapFeeManager) || ''),
      link: '',
      editableText: editableBy,
      attributeImmutabilityText: isStable(pool.type)
        ? ` except for swap fees and AMP factor ${editableBy}`
        : ` except for swap fees ${editableBy}`,
    }
  }, [pool])

  const formattedPoolAttributes = useMemo(() => {
    if (!pool) return []
    const { name, symbol, createTime, dynamicData, type } = pool

    const attributes = [
      {
        title: 'Name',
        value: name,
      },
      {
        title: 'Symbol',
        value: symbol,
      },
      {
        title: 'Type',
        value: isBoosted(pool) ? 'Boosted' : getPoolTypeLabel(type),
      },
      {
        title: 'Protocol version',
        value: isCowAmmPool(pool.type) ? 'Balancer CoW AMM' : `Balancer V${pool.protocolVersion}`,
      },
      {
        title: 'Swap fees',
        value: `${fNum('feePercent', dynamicData.swapFee)} (${poolOwnerData?.editableText})`,
      },
      isStable(pool.type) && 'amp' in pool
        ? {
            title: 'AMP factor',
            value: `${fNum('integer', pool.amp)} (${poolOwnerData?.editableText})`,
          }
        : null,
      poolOwnerData
        ? {
            title: isV2 ? 'Pool owner' : 'Swap fee manager',
            value: poolOwnerData.title,
          }
        : null,
      {
        title: 'Attribute immutability',
        value: `Immutable${poolOwnerData?.attributeImmutabilityText}`,
      },
      {
        title: 'Creation date',
        value: format(createTime * 1000, 'dd MMMM yyyy'),
      },
      {
        title: 'LP token price',
        value: toCurrency(usdValueForBpt(pool.address, pool.chain, '1')),
      },
    ]
    if (shouldHideSwapFee(pool?.type)) {
      return attributes.filter(a => a?.title !== 'Swap fees')
    }
    return attributes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, poolOwnerData])

  return formattedPoolAttributes
}
