import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

/* ── Score types ── */

export interface CategoryScore {
  score: number // 0-100
  summary: string // 2-3 sentences
  evidence: string[] // transcript quotes
  suggestion: string // specific improvement
}

export interface SessionScores {
  overall: number // 0-100
  categories: {
    clarity: CategoryScore
    structure: CategoryScore
    engagement: CategoryScore
    persuasiveness: CategoryScore
    audienceAlignment: CategoryScore
    delivery: CategoryScore
  }
  keyMoments: {
    strongest: { quote: string; why: string }
    weakest: { quote: string; why: string }
  }
  actionItems: {
    priority: number // 1, 2, 3
    title: string
    description: string
    impact: "high" | "medium"
  }[]
}

/* ── Session document ── */

export interface SessionDocument {
  userId: string
  createdAt: Timestamp
  setup: {
    topic: string
    audience: string
    goal: string
    additionalContext?: string
  }
  transcript: string | null
  messages: { role: string; content: string }[]
  audiencePulse: { text: string; emotion: string }[]
  slideReview: object | null
  researchContext: string | null
  scores: SessionScores | null
}

export interface SessionSummary {
  id: string
  topic: string
  audience: string
  date: Date
  overallScore: number | null
}

/* ── CRUD ── */

const SESSIONS_COLLECTION = "sessions"

export async function saveSession(
  data: Omit<SessionDocument, "createdAt">
): Promise<string> {
  const ref = doc(collection(db, SESSIONS_COLLECTION))
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getSession(
  sessionId: string,
  userId: string
): Promise<(SessionDocument & { id: string }) | null> {
  const ref = doc(db, SESSIONS_COLLECTION, sessionId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data() as SessionDocument
  if (data.userId !== userId) return null
  return { ...data, id: snap.id }
}

export async function updateSessionScores(
  sessionId: string,
  scores: SessionScores
): Promise<void> {
  const ref = doc(db, SESSIONS_COLLECTION, sessionId)
  await updateDoc(ref, { scores })
}

export async function listSessions(
  userId: string,
  maxResults = 20
): Promise<SessionSummary[]> {
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as SessionDocument
    return {
      id: d.id,
      topic: data.setup.topic,
      audience: data.setup.audience,
      date: data.createdAt?.toDate() ?? new Date(),
      overallScore: data.scores?.overall ?? null,
    }
  })
}
