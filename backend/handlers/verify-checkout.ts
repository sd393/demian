import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/auth'
import { checkRateLimit } from '@/backend/rate-limit'
import { RATE_LIMITS } from '@/backend/rate-limit-config'
import { stripe } from '@/backend/stripe'
import { ensureUserDoc, updateSubscription } from '@/backend/subscription'

export async function handleVerifyCheckout(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  // Rate limit: 5 verify attempts per 60s per user
  if (!checkRateLimit('verify-checkout:' + auth.uid, RATE_LIMITS.verifyCheckout.limit, RATE_LIMITS.verifyCheckout.windowMs).allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    )
  }

  let body: { session_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const sessionId = body.session_id
  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json(
      { error: 'Missing session_id' },
      { status: 400 }
    )
  }

  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    // Verify the session belongs to this user
    if (session.metadata?.firebaseUid !== auth.uid) {
      return NextResponse.json(
        { error: 'Session does not belong to this user' },
        { status: 403 }
      )
    }

    // Verify the session is complete and paid
    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Checkout session is not complete' },
        { status: 400 }
      )
    }

    const subscription =
      typeof session.subscription === 'object' ? session.subscription : null
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : subscription?.id ?? null
    const stripeCustomerId =
      typeof session.customer === 'string' ? session.customer : null

    await ensureUserDoc(auth.uid, auth.email)
    await updateSubscription(auth.uid, {
      plan: 'pro',
      subscriptionId,
      subscriptionStatus: 'active',
      stripeCustomerId,
    })

    return NextResponse.json({ plan: 'pro' })
  } catch (error) {
    console.error('Verify checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to verify checkout session' },
      { status: 500 }
    )
  }
}
