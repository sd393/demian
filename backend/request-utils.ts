import { NextRequest } from 'next/server'

export function getOrigin(request: NextRequest): string {
  const host = request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
} as const
