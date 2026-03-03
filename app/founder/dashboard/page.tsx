import { getFounderDashboardData } from "@/lib/queries"
import { redirect } from "next/navigation"
import { FounderDashboardClient } from "./client"

export default async function FounderDashboard() {
  const data = await getFounderDashboardData()

  if (!data) {
    redirect("/auth/login")
  }

  // If founder hasn't submitted a pitch yet, send them to submit
  if (!data.startup) {
    redirect("/founder/submit")
  }

  return (
    <FounderDashboardClient
      startup={data.startup}
      pitchVersions={data.pitchVersions}
      viewCount={data.viewCount}
    />
  )
}
