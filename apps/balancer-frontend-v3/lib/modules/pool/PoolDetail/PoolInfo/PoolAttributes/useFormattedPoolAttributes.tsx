'use client'

import { useMemo } from 'react'
import { usePool } from '../../../PoolProvider'
import { format } from 'date-fns'
import { DELEGATE_OWNER } from '@/lib/config/app.config'
import { zeroAddress } from 'viem'
import { abbreviateAddress } from '@/lib/shared/utils/addresses'
import { fNum } from '@/lib/shared/utils/numbers'
import { bptUsdValue, isCowAmmPool, isStable } from '../../../pool.helpers'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { getPoolTypeLabel, shouldHideSwapFee } from '../../../pool.utils'

export function useFormattedPoolAttributes() {
  const { pool } = usePool()
  const { toCurrency } = useCurrency()

  const poolOwnerData = useMemo(() => {
    if (!pool) return
    const { owner } = pool
    if (!owner) return

    if (owner === zeroAddress || isCowAmmPool(pool.type)) {
      return {
        title: 'No owner',
        link: '',
        editableText: 'non-editable',
        attributeImmutabilityText: '',
      }
    }

    if (owner === DELEGATE_OWNER) {
      return {
        title: 'Delegate owner',
        link: '',
        editableText: 'editable by governance',
        attributeImmutabilityText: isStable(pool.type)
          ? ' except for swap fees and AMP factor editable by governance'
          : ' except for swap fees editable by governance',
      }
    }

    return {
      title: abbreviateAddress(owner || ''),
      link: '',
      editableText: 'editable by pool owner',
      attributeImmutabilityText: isStable(pool.type)
        ? ' except for swap fees and AMP factor editable by the pool owner'
        : ' except for swap fees editable by the pool owner',
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
        value: getPoolTypeLabel(type),
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
            title: 'Pool Owner',
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
        value: toCurrency(bptUsdValue(pool, '1')),
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
