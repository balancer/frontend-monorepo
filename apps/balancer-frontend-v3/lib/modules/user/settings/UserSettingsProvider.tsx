'use client'

import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { SupportedCurrency } from '@/lib/shared/utils/currencies'
import { PropsWithChildren, createContext } from 'react'
import { bn } from '@/lib/shared/utils/numbers'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '../../local-storage/local-storage.constants'
import { useIsMounted } from '@/lib/shared/hooks/useIsMounted'

export type YesNo = 'yes' | 'no'

const DEFAULT_CURRENCY = SupportedCurrency.USD
const DEFAULT_SLIPPAGE = '0.5' // 0.5%
const DEFAULT_ENABLE_SIGNATURES: YesNo = 'yes'
const DEFAULT_ACCEPTED_POLICIES: string[] = []
const DEFAULT_ALLOW_SOUNDS: YesNo = 'yes'

export type UseUserSettingsResult = ReturnType<typeof _useUserSettings>
export const UserSettingsContext = createContext<UseUserSettingsResult | null>(null)

export function _useUserSettings({
  initCurrency,
  initSlippage,
  initEnableSignatures,
  initAcceptedPolicies,
  initAllowSounds,
}: {
  initCurrency: SupportedCurrency
  initSlippage: string
  initEnableSignatures: YesNo
  initAcceptedPolicies: string[]
  initAllowSounds: YesNo
}) {
  const isMounted = useIsMounted()

  const [_currency, setCurrency] = useLocalStorage<SupportedCurrency>(
    LS_KEYS.UserSettings.Currency,
    initCurrency
  )
  const currency = isMounted ? _currency : initCurrency

  const [_slippage, setSlippage] = useLocalStorage<string>(
    LS_KEYS.UserSettings.Slippage,
    initSlippage
  )

  const [_enableSignatures, setEnableSignatures] = useLocalStorage<YesNo>(
    LS_KEYS.UserSettings.EnableSignatures,
    initEnableSignatures
  )
  const enableSignatures = isMounted ? _enableSignatures : initEnableSignatures

  const [_allowSounds, setAllowSounds] = useLocalStorage<YesNo>(
    LS_KEYS.UserSettings.AllowSounds,
    initAllowSounds
  )
  const allowSounds = isMounted ? _allowSounds : initAllowSounds

  const slippage = isMounted ? _slippage : initSlippage
  const slippageDecimal = bn(slippage).div(100).toString()
  const slippageBps = bn(slippage).times(100).toString()

  const [_acceptedPolicies, setAcceptedPolicies] = useLocalStorage<string[]>(
    LS_KEYS.UserSettings.AcceptedPolicies,
    initAcceptedPolicies
  )
  const acceptedPolicies = isMounted ? _acceptedPolicies : initAcceptedPolicies

  return {
    currency,
    slippage,
    slippageDecimal,
    slippageBps,
    enableSignatures,
    acceptedPolicies,
    allowSounds,
    setCurrency,
    setSlippage,
    setEnableSignatures,
    setAcceptedPolicies,
    setAllowSounds,
  }
}

type ProviderProps = PropsWithChildren<{
  initCurrency?: string
  initSlippage?: string
  initPoolListView?: string
  initEnableSignatures?: string
  initAcceptedPolicies?: string[]
  initAllowSounds?: string
}>

export function UserSettingsProvider({
  initCurrency,
  initSlippage,
  initEnableSignatures,
  initAcceptedPolicies,
  initAllowSounds,
  children,
}: ProviderProps) {
  const _initCurrency = (initCurrency as SupportedCurrency) || DEFAULT_CURRENCY
  const _initSlippage = (initSlippage as string) || DEFAULT_SLIPPAGE
  const _initEnableSignatures = (initEnableSignatures as YesNo) || DEFAULT_ENABLE_SIGNATURES
  const _initAcceptedPolicies = initAcceptedPolicies || DEFAULT_ACCEPTED_POLICIES
  const _initAllowSounds = (initAllowSounds as YesNo) || DEFAULT_ALLOW_SOUNDS

  const hook = _useUserSettings({
    initCurrency: _initCurrency,
    initSlippage: _initSlippage,
    initEnableSignatures: _initEnableSignatures,
    initAcceptedPolicies: _initAcceptedPolicies,
    initAllowSounds: _initAllowSounds,
  })
  return <UserSettingsContext.Provider value={hook}>{children}</UserSettingsContext.Provider>
}

export const useUserSettings = (): UseUserSettingsResult =>
  useMandatoryContext(UserSettingsContext, 'UserSettings')
