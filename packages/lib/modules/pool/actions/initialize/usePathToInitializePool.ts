import { useEffect } from 'react'
import { usePoolCreationForm } from '../create/PoolCreationFormProvider'
import { useParams } from 'next/navigation'
import { useReadContracts } from 'wagmi'
import { formatUnits, Address, erc20Abi } from 'viem'
import { getChainId } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { AddressProvider } from '@balancer/sdk'
import { vaultExtensionAbi_V3 } from '@balancer/sdk'
import { PERCENTAGE_DECIMALS } from '../create/constants'

export function usePathToInitializePool() {
  const { poolCreationForm, poolAddress } = usePoolCreationForm()
  // const { network, poolType } = poolCreationForm.watch()
  // const router = useRouter()
  const params = useParams()

  const chainId = getChainId(params.network as GqlChain)

  const poolContractReads = ['name', 'symbol'].map(functionName => ({
    address: params.poolAddress as Address,
    abi: erc20Abi,
    chainId,
    functionName,
  }))

  const vaultContract = {
    address: AddressProvider.Vault(chainId),
    chainId,
    abi: vaultExtensionAbi_V3,
  }

  const vaultContractReads = ['getPoolTokenInfo', 'getPoolConfig'].map(functionName => ({
    ...vaultContract,
    functionName,
    args: [params.poolAddress as Address],
  }))

  const { data, isLoading } = useReadContracts({
    query: {
      enabled: !poolAddress && !!params.poolAddress && !!params.network && !!params.poolType,
    },
    contracts: [...poolContractReads, ...vaultContractReads],
  })

  // manage updating path as user configures / creates pool
  // useEffect(() => {
  //   let path = `/create/${network}/${poolType}`
  //   if (poolAddress) path += `/${poolAddress}`
  //   router.replace(path)
  // }, [poolAddress, network, poolType])

  console.log('data', data)

  // manage updating LS using params
  useEffect(() => {
    // if the values dont exist in LS yet
    if (
      !poolAddress &&
      !isLoading &&
      data?.every(item => item.status === 'success')
      // isSuccess
    ) {
      const [name, symbol, poolTokenInfo, poolConfig] = data ?? []

      const [tokenAddresses, tokenConfigs] = poolTokenInfo.result as unknown as [
        Address[],
        { rateProvider: Address; paysYieldFees: boolean }[],
      ]

      const { staticSwapFeePercentage, liquidityManagement } = poolConfig.result as unknown as {
        staticSwapFeePercentage: bigint
        liquidityManagement: {
          disableUnbalancedLiquidity: boolean
        }
      }

      console.log('poolConfig', poolConfig)
      console.log('staticSwapFeePercentage', staticSwapFeePercentage)

      const tokens = tokenAddresses.map((address, index) => ({
        address,
        rateProvider: tokenConfigs[index].rateProvider,
        paysYieldFees: tokenConfigs[index].paysYieldFees,
        amount: '',
      }))
      poolCreationForm.setValue('name', name?.result as string)
      poolCreationForm.setValue('symbol', symbol?.result as string)
      poolCreationForm.setValue('poolTokens', tokens)
      poolCreationForm.setValue(
        'swapFeePercentage',
        formatUnits(staticSwapFeePercentage, PERCENTAGE_DECIMALS)
      )
      poolCreationForm.setValue(
        'disableUnbalancedLiquidity',
        liquidityManagement.disableUnbalancedLiquidity
      )
    }
  }, [params.network, params.poolType, params.poolAddress, poolAddress, isLoading])
}

// http://localhost:3000/create/SEPOLIA/Stable/0x5574fB0DdfEa11254F6612BF6C0c117dB86D6aae
