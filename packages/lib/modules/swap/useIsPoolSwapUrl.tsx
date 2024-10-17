import { usePathname } from 'next/navigation'

export function useIsPoolSwapUrl() {
  const pathname = usePathname()
  return pathname.includes('/pools') && pathname.includes('/swap')
}
