/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/navigation'
import { MouseEvent } from 'react'

export function useRedirect(path: string) {
  const router = useRouter()

  /**
   * Redirects user to page and respects ctrl/cmd clicks to open in new tab.
   */
  function redirectToPage(event?: MouseEvent<HTMLElement>) {
    if (event && (event.ctrlKey || event.metaKey)) {
      window.open(path, '_blank')
    } else {
      router.push(path)
    }
  }

  return { redirectToPage }
}
