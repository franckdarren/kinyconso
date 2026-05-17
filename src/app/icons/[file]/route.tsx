import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

export const runtime = 'edge'

const PRIMARY = '#16a34a'
const DARK = '#15803d'

function sizeFromFilename(file: string): number {
  if (file.includes('512')) return 512
  return 192
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const size = sizeFromFilename(file)
  const maskable = file.includes('maskable')

  return new ImageResponse(
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${PRIMARY} 0%, ${DARK} 100%)`,
        borderRadius: maskable ? 0 : size * 0.22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          color: 'white',
          fontSize: size * 0.42,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1,
        }}
      >
        KC
      </span>
    </div>,
    { width: size, height: size },
  )
}
