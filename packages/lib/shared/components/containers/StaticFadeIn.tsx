import { PropsWithChildren } from 'react'

interface StaticFadeInProps extends PropsWithChildren {
  delay?: number
}

export function StaticFadeIn({ children, delay = 0 }: StaticFadeInProps) {
  return (
    <div
      style={{
        animation: `fadeIn 0.5s ease-out ${delay}ms forwards`,
        opacity: 0,
      }}
    >
      {children}
    </div>
  )
}
