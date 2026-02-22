import { NextRequest } from 'next/server'
import { handleAudiencePulse } from '@/backend/handlers/audience-pulse'

export async function POST(req: NextRequest) {
  return handleAudiencePulse(req)
}
