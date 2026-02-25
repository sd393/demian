import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/auth'
import { db } from '@/backend/firebase-admin'

export async function handleSessionDelete(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof Response) return auth

    const body = await request.json().catch(() => null)
    const sessionId = body?.sessionId
    if (typeof sessionId !== 'string' || !sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      )
    }

    const ref = db().collection('sessions').doc(sessionId)
    const snap = await ref.get()

    if (!snap.exists) {
      return NextResponse.json({ deleted: true })
    }

    if (snap.data()?.userId !== auth.uid) {
      return NextResponse.json(
        { error: 'Not authorized to delete this session' },
        { status: 403 }
      )
    }

    await ref.delete()
    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error('[session-delete] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
