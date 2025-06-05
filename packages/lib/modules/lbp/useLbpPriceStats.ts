import { useState } from 'react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useLbpForm } from './LbpFormProvider'
import { useTokenMetadata } from '../tokens/useTokenMetadata'

type PriceStats = {
  launchTokenSeed: number
  maxPrice: number
  saleMarketCap: string
  fdvMarketCap: string
  updateStats: (prices: number[][]) => void
}

export function useLbpPriceStats(): PriceStats {
  const {
    saleStructureForm: { watch },
  } = useLbpForm()
  const { saleTokenAmount, selectedChain, launchTokenAddress } = watch()

  const launchTokenSeed = Number(saleTokenAmount || 0)
  const { totalSupply: launchTokenTotalSupply } = useTokenMetadata(
    launchTokenAddress,
    selectedChain
  )

  const [maxPrice, setMaxPrice] = useState(0)
  const [saleMarketCap, setSaleMarketCap] = useState('')
  const [fdvMarketCap, setFdvMarketCap] = useState('')

  const updateStats = (prices: number[][]) => {
    const minPrice = Math.min(...prices.map(point => point[1]))
    const maxPrice = Math.max(...prices.map(point => point[1]))
    const minSaleMarketCap = minPrice * launchTokenSeed
    const maxSaleMarketCap = maxPrice * launchTokenSeed
    const minFdvMarketCap = minPrice * (launchTokenTotalSupply || 0)
    const maxFdvMarketCap = maxPrice * (launchTokenTotalSupply || 0)

    setMaxPrice(maxPrice)
    setSaleMarketCap(`$${fNum('fiat', minSaleMarketCap)} - $${fNum('fiat', maxSaleMarketCap)}`)
    setFdvMarketCap(`$${fNum('fiat', minFdvMarketCap)} - $${fNum('fiat', maxFdvMarketCap)}`)
  }

  return {
    launchTokenSeed,
    maxPrice,
    saleMarketCap,
    fdvMarketCap,
    updateStats,
  }
}
