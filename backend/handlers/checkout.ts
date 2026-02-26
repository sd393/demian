import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/auth'
import { checkRateLimit } from '@/backend/rate-limit'
import { RATE_LIMITS } from '@/backend/rate-limit-config'
import { stripe } from '@/backend/stripe'
import { createOrGetStripeCustomer, getUserPlan } from '@/backend/subscription'
import { getOrigin } from '@/backend/request-utils'

export async function handleCheckout(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  // Rate limit: 3 checkout attempts per 60s per user
  if (!checkRateLimit('checkout:' + auth.uid, RATE_LIMITS.checkout.limit, RATE_LIMITS.checkout.windowMs).allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    )
  }

  try {
    // If user already has active Pro, send them to billing portal instead
    const { plan, subscriptionStatus } = await getUserPlan(auth.uid)
    if (plan === 'pro' && subscriptionStatus === 'active') {
      const customerId = await createOrGetStripeCustomer(auth.uid, auth.email)
      const portalSession = await stripe().billingPortal.sessions.create({
        customer: customerId,
        return_url: `${getOrigin(request)}/account`,
      })
      return NextResponse.json({ url: portalSession.url })
    }

    const priceId = process.env.STRIPE_PRO_PRICE_ID
    if (!priceId) {
      console.error('STRIPE_PRO_PRICE_ID is not configured')
      return NextResponse.json(
        { error: 'Payment is not configured. Please try again later.' },
        { status: 500 }
      )
    }

    const customerId = await createOrGetStripeCustomer(auth.uid, auth.email)
    const origin = getOrigin(request)

    const session = await stripe().checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/chat?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/plans?checkout=canceled`,
      subscription_data: {
        metadata: { firebaseUid: auth.uid },
      },
      metadata: { firebaseUid: auth.uid },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
