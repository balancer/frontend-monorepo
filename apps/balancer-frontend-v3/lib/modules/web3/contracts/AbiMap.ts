import { FeeDistributorStaticAbi } from './abi/FeeDistributorStaticAbi'
import { LiquidityGaugeAbi } from './abi/LiquidityGaugeAbi'
import {
  balancerMinterAbi,
  balancerV2BalancerRelayerV6Abi,
  balancerV2GaugeV5Abi,
  balancerV2VaultAbi,
  feeDistributorAbi,
  veBalAbi,
  veDelegationProxyAbi,
} from './abi/generated'
import { VeDelegationProxyL2Abi } from './abi/veDelegationProxyL2'

export const AbiMap = {
  'balancer.vaultV2': balancerV2VaultAbi,
  'balancer.gaugeV5': balancerV2GaugeV5Abi,
  'balancer.minter': balancerMinterAbi,
  'balancer.relayerV6': balancerV2BalancerRelayerV6Abi,
  'balancer.feeDistributorStatic': FeeDistributorStaticAbi,
  'balancer.feeDistributor': feeDistributorAbi,
  'balancer.veDelegationProxy': veDelegationProxyAbi,
  'balancer.veDelegationProxyL2': VeDelegationProxyL2Abi,
  'balancer.veBAL': veBalAbi,
  'balancer.LiquidityGauge': LiquidityGaugeAbi,
}

export type AbiMapType = keyof typeof AbiMap | undefined
