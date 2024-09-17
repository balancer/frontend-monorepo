import { useContractAddress } from '@/lib/modules/web3/contracts/useContractAddress'

export type VaultVersion = 2 | 3

export function useVault(version: VaultVersion | number) {
  const vaultV2Address = useContractAddress('balancer.vaultV2')
  //TODO: uncomment when vault is deployed in all networks
  // const vaultV3Address = useContractAddress('balancer.vaultV3')
  const sepoliaVaultAddress = '0x89aa28a8D2B327cD9dB4aDc0f259D757F000AE66'
  const vaultV3Address = sepoliaVaultAddress
  const vaultAddress = version === 3 ? vaultV3Address : vaultV2Address

  return {
    vaultAddress,
  }
}
