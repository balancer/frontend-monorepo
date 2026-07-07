import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Balancer Analytics',
  description: 'Analytics dashboard for the Balancer protocol',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
