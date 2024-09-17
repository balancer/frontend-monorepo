/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'

export function useSkipInitialQuery(queryVariables: Record<any, any>) {
  const [initQueryVarsAreSet, setInitQueryVarsAreSet] = useState(false)
  const [skipQuery, setSkipQuery] = useState(true)

  useEffect(() => {
    setInitQueryVarsAreSet(true)
  }, [JSON.stringify(queryVariables)])

  useEffect(() => {
    if (initQueryVarsAreSet) setSkipQuery(false)
  }, [JSON.stringify(queryVariables)])

  return skipQuery
}
