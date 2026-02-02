import { useParams } from 'next/navigation'
import { getChainId } from '@repo/lib/config/app.config'
import { getLbpPathParams } from './getLbpPathParams'
import { useLbpForm } from './LbpFormProvider'
import { useReadContracts } from 'wagmi'
import { Address, formatUnits } from 'viem'
import { liquidityBootstrappingPoolAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { useEffect, useRef } from 'react'
import { SaleStructureForm, UserActions, WeightAdjustmentType } from './lbp.types'
import { PERCENTAGE_DECIMALS } from '../pool/actions/create/constants'
import { toJsTimestamp, toISOString } from '@repo/lib/shared/utils/time'

type ReadContractResponse<T> = { result: T | undefined; status: 'success' | 'failure' }
type LBPoolImmutableData = {
  startTime: bigint
  endTime: bigint
  projectTokenIndex: number
  reserveTokenIndex: number
  startWeights: [bigint, bigint]
  endWeights: [bigint, bigint]
  tokens: [Address, Address]
}

type LbpDataResponse = [
  ReadContractResponse<Address>, // owner
  ReadContractResponse<string>, // name
  ReadContractResponse<string>, // symbol
  ReadContractResponse<Address>, // projectToken
  ReadContractResponse<Address>, // reserveToken
  ReadContractResponse<bigint>, // staticSwapFeePercentage
  ReadContractResponse<LBPoolImmutableData>, // lbpImmutableData
  ReadContractResponse<boolean>, // isProjectTokenSwapInBlocked
]

export function useHydrateLbpForm() {
  const { slug } = useParams()
  const params = getLbpPathParams(slug as string[] | undefined)
  const { poolAddress, setPoolAddress, saleStructureForm } = useLbpForm()
  const chainId = params.chain ? getChainId(params.chain) : undefined

  const areAllParamsDefined = !!params.chain && !!params.poolAddress
  const shouldHydrateLbpForm = !poolAddress && areAllParamsDefined

  const hasHydratedRef = useRef(false)

  useEffect(() => {
    // clean up LS and ref in case user wants to load another pool
    if (areAllParamsDefined) {
      setPoolAddress(undefined)
      hasHydratedRef.current = false
    }
  }, [areAllParamsDefined, setPoolAddress])

  const lbpFunctionNames = [
    'owner',
    'name',
    'symbol',
    'getProjectToken',
    'getReserveToken',
    'getStaticSwapFeePercentage',
    'getLBPoolImmutableData',
    'isProjectTokenSwapInBlocked',
  ]

  const lbpContractReads = lbpFunctionNames.map(functionName => ({
    address: params.poolAddress,
    abi: liquidityBootstrappingPoolAbi,
    chainId,
    functionName,
  }))

  const { data: lbpData, isLoading: isLbpLoading } = useReadContracts({
    contracts: lbpContractReads,
    query: { enabled: lbpContractReads.length > 0 && shouldHydrateLbpForm },
  }) as { data: LbpDataResponse; isLoading: boolean }

  useEffect(() => {
    if (!isLbpLoading && !!lbpData && shouldHydrateLbpForm && !hasHydratedRef.current) {
      const [
        owner,
        name,
        symbol,
        projectToken,
        reserveToken,
        staticSwapFeePercentage,
        lbpImmutableData,
        isProjectTokenSwapInBlocked,
      ] = lbpData

      if (
        owner.result === undefined ||
        name.result === undefined ||
        symbol.result === undefined ||
        projectToken.result === undefined ||
        reserveToken.result === undefined ||
        staticSwapFeePercentage.result === undefined ||
        lbpImmutableData.result === undefined ||
        isProjectTokenSwapInBlocked.result === undefined ||
        params.chain === undefined
      ) {
        return
      }

      const userActions = isProjectTokenSwapInBlocked.result
        ? UserActions.BUY_ONLY
        : UserActions.BUY_AND_SELL

      const { startWeights, endWeights, projectTokenIndex } = lbpImmutableData.result

      const projectTokenStartWeight = +formatUnits(
        startWeights[projectTokenIndex],
        PERCENTAGE_DECIMALS
      )
      const projectTokenEndWeight = +formatUnits(endWeights[projectTokenIndex], PERCENTAGE_DECIMALS)

      let weightAdjustmentType: WeightAdjustmentType
      let customStartWeight = 90
      let customEndWeight = 10

      if (projectTokenStartWeight === 90 && projectTokenEndWeight === 10) {
        weightAdjustmentType = WeightAdjustmentType.LINEAR_90_10
      } else if (projectTokenStartWeight === 90 && projectTokenEndWeight === 50) {
        weightAdjustmentType = WeightAdjustmentType.LINEAR_90_50
      } else {
        weightAdjustmentType = WeightAdjustmentType.CUSTOM
        customStartWeight = projectTokenStartWeight
        customEndWeight = projectTokenEndWeight
      }

      const saleStructureFormValues: SaleStructureForm = {
        selectedChain: params.chain,
        launchTokenAddress: projectToken.result,
        saleType: '',
        collateralTokenAddress: reserveToken.result,
        saleTokenAmount: '',
        collateralTokenAmount: '',
        userActions,
        weightAdjustmentType,
        customStartWeight,
        customEndWeight,
        fee: +formatUnits(staticSwapFeePercentage.result, PERCENTAGE_DECIMALS),
        startDateTime: formatLbpTimestamp(lbpImmutableData.result.startTime),
        endDateTime: formatLbpTimestamp(lbpImmutableData.result.endTime),
        launchTokenRate: '',
      }

      saleStructureForm.reset(saleStructureFormValues)
      setPoolAddress(params.poolAddress)
      hasHydratedRef.current = true
    }
  }, [
    params.chain,
    params.poolAddress,
    lbpData,
    isLbpLoading,
    shouldHydrateLbpForm,
    saleStructureForm,
    setPoolAddress,
  ])
  return { isLbpLoading }
}

function formatLbpTimestamp(timestamp: bigint): string {
  return toISOString(toJsTimestamp(Number(timestamp))).slice(0, 16)
}
