import { NextRequest } from 'next/server'
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
      return new Response(
        JSON.stringify({ error: 'No subscription found. Subscribe first.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const origin = getOrigin(request)
    const session = await stripe().billingPortal.sessions.create({
      customer: doc.stripeCustomerId,
      return_url: `${origin}/account`,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Billing portal error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to open billing portal. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
