import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { redirect } from 'next/navigation'

export default function CreatePage() {
  redirect(`/create/${PROJECT_CONFIG.defaultNetwork}`)
}
