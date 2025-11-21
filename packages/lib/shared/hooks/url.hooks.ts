import { useEffect, useState } from 'react'
import { isValidUrl, normalizeUrl } from '../utils/urls'

export function useCheckImageUrl(url: string) {
  const [isChecking, setChecking] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (isValidUrl(url) !== true) return

    const image = new Image()

    image.onload = function () {
      if (image.width <= 0) {
        setErrorMessage('Invalid image')
      }

      setChecking(false)
    }

    image.onerror = function () {
      setErrorMessage('Unreachable URL or invalid image')
      setChecking(false)
    }

    // We use an async call to avoid linting issues like
    // https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-effect
    const updateImageUrl = async () => {
      setErrorMessage(undefined)
      setChecking(true)
      image.src = normalizeUrl(url)
    }
    updateImageUrl()
  }, [url])

  if (isValidUrl(url) !== true) return { isChecking: false, error: isValidUrl(url) }
  if (isChecking) return { isChecking: true, error: undefined }

  return {
    isChecking: false,
    error: errorMessage,
  }
}
