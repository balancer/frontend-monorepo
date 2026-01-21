import { useEffect, useState } from 'react'
import { validateUrlFormat, normalizeUrl } from '../utils/urls'

export function useCheckImageUrl(url: string) {
  const [lastCheck, setLastCheck] = useState({ url: '', error: '' })

  const urlFormatErrorMsg = validateUrlFormat(url)
  const hasFormatError = urlFormatErrorMsg !== true // validateUrlFormat returns true if format valid
  const isEmpty = !url
  const shouldCheckImage = !isEmpty && !hasFormatError

  useEffect(() => {
    if (!shouldCheckImage) return

    let isStale = false

    const image = new Image()
    image.src = normalizeUrl(url)
    image
      .decode()
      .then(() => {
        if (!isStale) setLastCheck({ url, error: '' })
      })
      .catch(e => {
        console.error(e)
        if (!isStale) setLastCheck({ url, error: 'Unreachable URL or invalid image' })
      })

    // Cleanup: if url changes before image loads, mark this check as stale
    return () => {
      isStale = true
    }
  }, [url, shouldCheckImage])

  const getError = (): string | undefined => {
    if (isEmpty) return undefined
    if (hasFormatError) return urlFormatErrorMsg
    if (lastCheck.url === url) return lastCheck.error || undefined
    return undefined // Still loading
  }

  return { error: getError() }
}
