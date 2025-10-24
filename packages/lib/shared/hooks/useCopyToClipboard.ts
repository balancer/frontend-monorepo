import { useState, useRef, useEffect } from 'react'

export function useCopyToClipboard(resetDelay = 2000) {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => setIsCopied(false), resetDelay)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  return { copyToClipboard, isCopied }
}
