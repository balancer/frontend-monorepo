import { useQuery } from '@tanstack/react-query'
import { isValidUrl } from '../utils/urls'

export function useCheckImageUrl(url: string, allowed: string[]) {
  const { isChecking, error, headers } = useCheckUrl(url)

  if (isChecking || error) return { isChecking, error }
  if (!headers || !headers.get('Content-Type')) return { isChecking, error: 'Invalid URL' }

  if (!allowed.includes(headers.get('Content-Type') || '')) {
    return { isChecking, error: `Invalid image format: ${allowed.join(',')} allowed` }
  }

  return { isChecking: false, error: undefined }
}

export function useCheckWebsiteUrl(url: string) {
  const { isChecking, error } = useCheckUrl(url)

  return { isChecking, error }
}

function useCheckUrl(url: string) {
  const validUrlError = isValidUrl(url)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [url],
    queryFn: async () => {
      try {
        return await fetch(url, { method: 'HEAD' })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new Error('Unreachable URL')
      }
    },
    enabled: validUrlError === true,
  })

  if (validUrlError !== true) return { isChecking: false, error: validUrlError }

  if (isPending) return { isChecking: true, error: undefined }
  if (isError) return { isChecking: false, error: error.message }
  if (data.status < 200 || data.status > 400) return { isChecking: false, error: 'Unreachable URL' }

  return {
    isChecking: false,
    error: undefined,
    headers: data.headers,
  }
}
