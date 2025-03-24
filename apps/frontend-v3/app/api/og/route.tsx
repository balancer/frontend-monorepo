import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') ?? 'Pool'

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <h1 style={{ fontSize: 60, margin: 0 }}>{name}</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
