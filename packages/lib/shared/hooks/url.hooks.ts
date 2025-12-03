import { useEffect, useState } from 'react'
import { isValidUrl, normalizeUrl } from '../utils/urls'

export function useCheckImageUrl(url: string) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (isValidUrl(url) !== true) return

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
  }, [url])

  if (isValidUrl(url) !== true) return { error: isValidUrl(url) as string }

  return { error: errorMessage }
}
