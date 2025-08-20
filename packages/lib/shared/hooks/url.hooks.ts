import { useEffect, useState } from 'react'
import { isValidUrl, normalizeUrl } from '../utils/urls'

export function useCheckImageUrl(url: string) {
  const validUrlError = isValidUrl(url)

  const [isChecking, setChecking] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [image] = useState<HTMLImageElement>(new Image())

  image.onload = function () {
    if (!image || image.width <= 0) {
      setErrorMessage('Invalid image')
    }
    setChecking(false)
  }

  image.onerror = function () {
    setErrorMessage('Unreachable URL or invalid image')
    setChecking(false)
  }

  useEffect(() => {
    if (validUrlError !== true) return

    setErrorMessage(undefined)
    setChecking(true)
    image.src = normalizeUrl(url)
  }, [image, validUrlError, url])

  if (validUrlError !== true) return { isChecking: false, error: validUrlError }
  if (isChecking) return { isChecking: true, error: undefined }

  return {
    isChecking: false,
    error: errorMessage,
  }
}
