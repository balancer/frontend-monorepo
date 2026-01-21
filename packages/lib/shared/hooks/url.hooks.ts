import { useEffect, useState } from 'react'
import { isValidUrl, normalizeUrl } from '../utils/urls'

export function useCheckImageUrl(url: string) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const isUrlFormatInvalid = isValidUrl(url) !== true
  const isUrlEmpty = !url
  const shouldCheckUrl = !isUrlFormatInvalid && !isUrlEmpty

  useEffect(() => {
    if (!shouldCheckUrl) return

    const image = new Image()
    image.src = normalizeUrl(url)

    image
      .decode()
      .then(() => {
        setErrorMessage(undefined)
      })
      .catch(e => {
        console.error(e)
        setErrorMessage('Unreachable URL or invalid image')
      })
  }, [url, shouldCheckUrl])

  if (isUrlEmpty) return { error: undefined }
  if (isUrlFormatInvalid) return { error: isValidUrl(url) as string }

  return { error: errorMessage }
}
