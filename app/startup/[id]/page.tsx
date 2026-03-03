import { getStartupDetail, getDeckSignedUrl } from "@/lib/queries"
import { redirect, notFound } from "next/navigation"
import { StartupDetailClient } from "./client"

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const data = await getStartupDetail(id)

  if (!data) {
    redirect("/auth/login")
  }

  if (!data.startup) {
    notFound()
  }

  // Get signed deck URL if available
  let deckUrl: string | null = null
  if (data.startup.deck_path) {
    deckUrl = await getDeckSignedUrl(data.startup.deck_path)
  }

  return (
    <StartupDetailClient
      startup={data.startup}
      pitchVersions={data.pitchVersions}
      isSaved={data.isSaved}
      similarStartups={data.similarStartups}
      viewCount={data.viewCount}
      deckUrl={deckUrl}
      userRole={data.userRole}
    />
  )
}
