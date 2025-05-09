import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren, useMemo, useState } from 'react'

export enum PoolActivityView {
  Chart = 'chart',
  List = 'list',
}

export function usePoolActivityViewTypeLogic() {
  const [poolActivityView, setPoolActivityView] = useState<PoolActivityView>(PoolActivityView.Chart)

  const isListView = useMemo(() => poolActivityView === PoolActivityView.List, [poolActivityView])
  const isChartView = useMemo(() => poolActivityView === PoolActivityView.Chart, [poolActivityView])

  return {
    isListView,
    isChartView,
    setPoolActivityView,
  }
}

export type UsePoolActivityViewTypeResult = ReturnType<typeof usePoolActivityViewTypeLogic>
export const PoolActivityViewTypeContext = createContext<UsePoolActivityViewTypeResult | null>(null)

export function PoolActivityViewTypeProvider({ children }: PropsWithChildren) {
  const poolActivityViewType = usePoolActivityViewTypeLogic()

  return (
    <PoolActivityViewTypeContext.Provider value={poolActivityViewType}>
      {children}
    </PoolActivityViewTypeContext.Provider>
  )
}

export const usePoolActivityViewType = (): UsePoolActivityViewTypeResult =>
  useMandatoryContext(PoolActivityViewTypeContext, 'PoolActivityViewType')
