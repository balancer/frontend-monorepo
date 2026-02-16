import { useParams } from 'next/navigation'
import { getChainId } from '@repo/lib/config/app.config'
import { getLbpPathParams } from './getLbpPathParams'
import { useLbpForm } from './LbpFormProvider'
import { useQuery } from '@apollo/client/react'
import { useReadContract, useReadContracts } from 'wagmi'
import { Address, formatUnits } from 'viem'
import { useEffect, useRef } from 'react'
import { ProjectInfoForm, SaleStructureForm, UserActions, WeightAdjustmentType } from './lbp.types'
import { PERCENTAGE_DECIMALS } from '../pool/actions/create/constants'
import { toJsTimestamp, toISOString } from '@repo/lib/shared/utils/time'
import { FixedPriceLBPoolAbi } from '@repo/lib/modules/web3/contracts/abi/FixedPriceLBPoolAbi'
import { LBPoolAbi } from '@repo/lib/modules/web3/contracts/abi/LBPoolAbi'
import {
  GetPoolDocument,
  GetPoolQuery,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'

type ReadContractResponse<T> = { result: T | undefined; status: 'success' | 'failure' }

type PoolVersionResponse = {
  name: string
  version: number
  deployment: string
}

type LBPoolType = 'LBPool' | 'FixedPriceLBPool'

type LBPoolImmutableData = {
  startTime: bigint
  endTime: bigint
  projectTokenIndex: number
  reserveTokenIndex: number
  startWeights: [bigint, bigint]
  endWeights: [bigint, bigint]
  tokens: [Address, Address]
}

type FixedPriceLBPoolImmutableData = {
  tokens: [Address, Address]
  decimalScalingFactors: [bigint, bigint]
  startTime: bigint
  endTime: bigint
  projectTokenIndex: number
  reserveTokenIndex: number
  projectTokenRate: bigint
}

type CommonLbpResponse = [
  ReadContractResponse<Address>, // owner
  ReadContractResponse<string>, // name
  ReadContractResponse<string>, // symbol
  ReadContractResponse<Address>, // projectToken
  ReadContractResponse<Address>, // reserveToken
  ReadContractResponse<bigint>, // staticSwapFeePercentage
  ReadContractResponse<boolean>, // isProjectTokenSwapInBlocked
]

type LbpDataResponse = [
  ...CommonLbpResponse,
  ReadContractResponse<LBPoolImmutableData>, // lbpImmutableData
]

type FixedPriceLbpDataResponse = [
  ...CommonLbpResponse,
  ReadContractResponse<FixedPriceLBPoolImmutableData>, // fixedPriceImmutableData
]

type ContractDataResponse = LbpDataResponse | FixedPriceLbpDataResponse

function formatLbpTimestamp(timestamp: bigint): string {
  return toISOString(toJsTimestamp(Number(timestamp))).slice(0, 16)
}

export function useHydrateLbpForm() {
  const { slug } = useParams()
  const hasHydratedRef = useRef(false)
  const hasHydratedProjectInfoRef = useRef(false)
  const { poolAddress, setPoolAddress, saleStructureForm, projectInfoForm } = useLbpForm()

  const params = getLbpPathParams(slug as string[] | undefined)
  const chainId = params.chain ? getChainId(params.chain) : undefined
  const areAllParamsDefined = !!params.chain && !!params.poolAddress
  const shouldHydrateLbpForm = !poolAddress && areAllParamsDefined
  const shouldFetchPoolData = areAllParamsDefined

  const { data: poolData, loading: isPoolLoading } = useQuery(GetPoolDocument, {
    variables: {
      id: params.poolAddress?.toLowerCase() || '',
      chain: params.chain!,
    },
    skip: !shouldFetchPoolData,
  })

  const { data: poolVersionData, isLoading: isVersionLoading } = useReadContract({
    address: params.poolAddress,
    abi: LBPoolAbi, // version signature is the same for both LBPool and FixedPriceLBPool
    chainId,
    functionName: 'version',
    query: { enabled: shouldHydrateLbpForm },
  })

  const poolType: LBPoolType | undefined = poolVersionData
    ? ((JSON.parse(poolVersionData as string) as PoolVersionResponse).name as LBPoolType)
    : undefined

  const lbpFunctionNames = [
    'owner',
    'name',
    'symbol',
    'getProjectToken',
    'getReserveToken',
    'getStaticSwapFeePercentage',
    'isProjectTokenSwapInBlocked',
    ...(poolType === 'LBPool' ? ['getLBPoolImmutableData'] : ['getFixedPriceLBPoolImmutableData']),
  ]

  const lbpContractReads = poolType
    ? lbpFunctionNames.map(functionName => ({
        address: params.poolAddress,
        abi: poolType === 'LBPool' ? LBPoolAbi : FixedPriceLBPoolAbi,
        chainId,
        functionName,
      }))
    : []

  const enabled = !!poolType && lbpContractReads.length > 0 && shouldHydrateLbpForm

  const { data: contractData, isLoading: isContractLoading } = useReadContracts({
    contracts: lbpContractReads,
    query: {
      enabled,
    },
  }) as { data: ContractDataResponse; isLoading: boolean }

  function getProjectInfoFormValues(
    pool: NonNullable<GetPoolQuery['pool']> | undefined
  ): ProjectInfoForm | null {
    if (!pool) return null

    const projectTokenAddress =
      'projectToken' in pool && typeof pool.projectToken === 'string'
        ? pool.projectToken.toLowerCase()
        : undefined

    const tokenIconUrl =
      pool.poolTokens.find(token => token.address.toLowerCase() === projectTokenAddress)?.logoURI ||
      pool.poolTokens.find(token => !!token.logoURI)?.logoURI ||
      ''

    const lbpName = 'lbpName' in pool && typeof pool.lbpName === 'string' ? pool.lbpName : ''
    const lbpOwner = 'lbpOwner' in pool && typeof pool.lbpOwner === 'string' ? pool.lbpOwner : ''
    const description =
      'description' in pool && typeof pool.description === 'string' ? pool.description : ''
    const website = 'website' in pool && typeof pool.website === 'string' ? pool.website : ''
    const x = 'x' in pool && typeof pool.x === 'string' ? pool.x : ''
    const telegram = 'telegram' in pool && typeof pool.telegram === 'string' ? pool.telegram : ''
    const discord = 'discord' in pool && typeof pool.discord === 'string' ? pool.discord : ''

    return {
      name: lbpName || pool.name || '',
      description,
      tokenIconUrl,
      websiteUrl: website,
      xHandle: x,
      telegramHandle: telegram,
      discordUrl: discord,
      owner: lbpOwner || pool.owner || '',
      poolCreator: pool.poolCreator || '',
      disclaimerAccepted: false,
    }
  }

  function handleLBPoolData(lbpData: LbpDataResponse) {
    const [
      owner,
      name,
      symbol,
      projectToken,
      reserveToken,
      staticSwapFeePercentage,
      isProjectTokenSwapInBlocked,
      lbpImmutableData,
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
      saleType: GqlPoolType.LiquidityBootstrapping,
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
    }

    saleStructureForm.reset(saleStructureFormValues)
    setPoolAddress(params.poolAddress)
    hasHydratedRef.current = true
  }

  function handleFixedPriceLBPoolData(fixedPriceData: FixedPriceLbpDataResponse) {
    const [
      owner,
      name,
      symbol,
      projectToken,
      reserveToken,
      staticSwapFeePercentage,
      isProjectTokenSwapInBlocked,
      fixedPriceImmutableData,
    ] = fixedPriceData

    if (
      owner.result === undefined ||
      name.result === undefined ||
      symbol.result === undefined ||
      projectToken.result === undefined ||
      reserveToken.result === undefined ||
      staticSwapFeePercentage.result === undefined ||
      fixedPriceImmutableData.result === undefined ||
      isProjectTokenSwapInBlocked.result === undefined ||
      params.chain === undefined
    ) {
      return
    }

    const userActions = isProjectTokenSwapInBlocked.result
      ? UserActions.BUY_ONLY
      : UserActions.BUY_AND_SELL

    const { startTime, endTime } = fixedPriceImmutableData.result

    const saleStructureFormValues: SaleStructureForm = {
      selectedChain: params.chain,
      launchTokenAddress: projectToken.result,
      saleType: GqlPoolType.FixedLbp,
      collateralTokenAddress: reserveToken.result,
      saleTokenAmount: '',
      collateralTokenAmount: '',
      userActions,
      fee: +formatUnits(staticSwapFeePercentage.result, PERCENTAGE_DECIMALS),
      startDateTime: formatLbpTimestamp(startTime),
      endDateTime: formatLbpTimestamp(endTime),
      launchTokenRate: formatUnits(fixedPriceImmutableData.result.projectTokenRate, 18), // Assuming 18 decimals
    }

    saleStructureForm.reset(saleStructureFormValues)
    setPoolAddress(params.poolAddress)
    hasHydratedRef.current = true
  }

  useEffect(() => {
    if (!isVersionLoading && poolType && shouldHydrateLbpForm && !hasHydratedRef.current) {
      if (poolType === 'LBPool' && !isContractLoading && contractData) {
        handleLBPoolData(contractData as LbpDataResponse)
      } else if (poolType === 'FixedPriceLBPool' && !isContractLoading && contractData) {
        handleFixedPriceLBPoolData(contractData as FixedPriceLbpDataResponse)
      }
    }
  }, [
    params.chain,
    params.poolAddress,
    poolType,
    isVersionLoading,
    contractData,
    isContractLoading,
    shouldHydrateLbpForm,
    saleStructureForm,
    setPoolAddress,
  ])

  useEffect(() => {
    if (!areAllParamsDefined || hasHydratedProjectInfoRef.current) return

    const projectInfoFormValues = getProjectInfoFormValues(poolData?.pool)
    if (!projectInfoFormValues) return

    projectInfoForm.reset(projectInfoFormValues)
    hasHydratedProjectInfoRef.current = true
  }, [areAllParamsDefined, poolData, projectInfoForm])

  useEffect(() => {
    // clean up LS and ref in case user wants to load another pool
    if (!areAllParamsDefined || !poolAddress) {
      return
    }

    if (params.poolAddress && poolAddress !== params.poolAddress) {
      setPoolAddress(undefined)
      hasHydratedRef.current = false
      hasHydratedProjectInfoRef.current = false
    }
  }, [areAllParamsDefined, params.poolAddress, poolAddress, setPoolAddress])

  return { isLbpLoading: isVersionLoading || isContractLoading || isPoolLoading }
}
