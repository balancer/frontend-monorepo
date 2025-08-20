import { usePoolCreationForm } from './PoolCreationFormProvider'
import type { PoolCreationToken } from './PoolCreationFormProvider'

export function usePoolCreationConfig() {
  const {
    poolConfigForm: { watch, setValue },
  } = usePoolCreationForm()

  // Helper functions for updating pool tokens
  const updatePoolToken = (index: number, updates: Partial<PoolCreationToken>) => {
    const currentTokens = watch('poolTokens')
    const newPoolTokens = [...currentTokens]
    newPoolTokens[index] = { ...newPoolTokens[index], ...updates }
    setValue('poolTokens', newPoolTokens)
  }

  const updatePoolTokenConfig = (
    index: number,
    configUpdates: Partial<PoolCreationToken['config']>
  ) => {
    const currentTokens = watch('poolTokens')
    const newPoolTokens = [...currentTokens]
    newPoolTokens[index] = {
      ...newPoolTokens[index],
      config: { ...newPoolTokens[index].config, ...configUpdates },
    }
    setValue('poolTokens', newPoolTokens)
  }

  // Specific helpers for common operations ?
  //   const setTokenWeight = (index: number, weight: string) => {
  //     updatePoolTokenConfig(index, { weight })
  //   }

  //   const setTokenAmount = (index: number, amount: string) => {
  //     updatePoolToken(index, { amount })
  //   }

  return {
    // Form values
    poolTokens: watch('poolTokens'),
    poolType: watch('poolType'),
    weightedPoolStructure: watch('weightedPoolStructure'),
    protocol: watch('protocol'),
    network: watch('network'),
    updatePoolToken,
    updatePoolTokenConfig,
  }
}
