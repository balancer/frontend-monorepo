import { captureError, ensureError } from '@repo/lib/shared/utils/errors'
import { NextRequest } from 'next/server'

type Params = {
  channel: string
  text: string
}

const API_URL = 'https://slack.com/api'
const SLACK_AUTH_TOKEN = process.env.SLACK_BOT_TOKEN

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Params

  try {
    const url = `${API_URL}/chat.postMessage
`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SLACK_AUTH_TOKEN}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    })

    const slackResponse = await response.json()
    if (!slackResponse.ok) {
      throw new Error(slackResponse.error, { cause: slackResponse.response_metadata.messages[0] })
    }

    return Response.json({})
  } catch (err) {
    const error = ensureError(err)
    console.error('❌ Network error:', error)
    captureError(error, { extra: { message: 'Error while sending message to Slack channel' } })
    return Response.json({
      error: 'Internal server error',
    })
  }
}
