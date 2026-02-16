import { isProd } from '@repo/lib/config/app.config'
import { isBalancer } from '@repo/lib/config/getProjectConfig'

export async function sendMessage(channelId: string, text: string) {
  const payload = {
    channel: channelId,
    text,
  }

  try {
    if (!isProd || !isBalancer) return

    const response = await fetch('/api/slack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (data.error) console.log('❌ Slack API error:', data.error)
  } catch (error) {
    console.error('❌ Network error:', error)
  }
}
