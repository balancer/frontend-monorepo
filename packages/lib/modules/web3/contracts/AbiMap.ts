import { FeeDistributorStaticAbi } from './abi/FeeDistributorStaticAbi'
import { LiquidityGaugeAbi } from './abi/LiquidityGaugeAbi'
import { GaugeWorkingBalanceHelperAbi } from './abi/GaugeWorkingBalanceHelperAbi'
import { OmniVotingEscrowAbi } from './abi/OmniVotingEscrowAbi'
import { GaugeControllerAbi } from './abi/GaugeControllerAbi'
import {
  balancerMinterAbi,
  balancerV2BalancerRelayerV6Abi,
  balancerV2GaugeV5Abi,
  balancerV2VaultAbi,
  feeDistributorAbi,
  reClammPoolAbi,
  veBalAbi,
  veDelegationProxyAbi,
} from './abi/generated'
import { VeDelegationProxyL2Abi } from './abi/veDelegationProxyL2'
import { sfcAbi, sonicStakingAbi, reliquaryAbi } from './abi/beets/generated'
import { LiquidityGaugeV5Abi } from './abi/LiquidityGaugeV5Abi'
import { permit2Abi } from '@balancer/sdk'

export const AbiMap = {
  'balancer.vaultV2': balancerV2VaultAbi,
  'balancer.gaugeV5': balancerV2GaugeV5Abi,
  'balancer.minter': balancerMinterAbi,
  'balancer.relayerV6': balancerV2BalancerRelayerV6Abi,
  'balancer.feeDistributorStatic': FeeDistributorStaticAbi,
  'balancer.gaugeWorkingBalanceHelperAbi': GaugeWorkingBalanceHelperAbi,
  'balancer.feeDistributor': feeDistributorAbi,
  'balancer.veDelegationProxy': veDelegationProxyAbi,
  'balancer.veDelegationProxyL2': VeDelegationProxyL2Abi,
  'balancer.veBAL': veBalAbi,
  'balancer.LiquidityGauge': LiquidityGaugeAbi,
  'balancer.omniVotingEscrowAbi': OmniVotingEscrowAbi,
  'balancer.gaugeControllerAbi': GaugeControllerAbi,
  'balancer.liquidityGaugeV5Abi': LiquidityGaugeV5Abi,
  'balancer.reClammPool': reClammPoolAbi,
  'beets.lstStaking': sonicStakingAbi,
  'beets.sfc': sfcAbi,
  'beets.reliquary': reliquaryAbi,
  permit2: permit2Abi,
}

export type AbiMapType = keyof typeof AbiMap | undefined
