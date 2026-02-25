import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/auth'
import { stripe } from '@/backend/stripe'
import { ensureUserDoc } from '@/backend/subscription'
import { getOrigin } from '@/backend/request-utils'

export async function handleBillingPortal(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  try {
    const doc = await ensureUserDoc(auth.uid, auth.email)

    if (!doc.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found. Subscribe first.' },
        { status: 400 }
      )
    }

    const origin = getOrigin(request)
    const session = await stripe().billingPortal.sessions.create({
      customer: doc.stripeCustomerId,
      return_url: `${origin}/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json(
      { error: 'Failed to open billing portal. Please try again.' },
      { status: 500 }
    )
  }
}
