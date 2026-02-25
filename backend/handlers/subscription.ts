import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/auth'
import { getUserPlan } from '@/backend/subscription'

export async function handleGetSubscription(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  try {
    const { plan, subscriptionStatus } = await getUserPlan(auth.uid)

    return NextResponse.json({ plan, subscriptionStatus })
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status.' },
      { status: 500 }
    )
  }
}
