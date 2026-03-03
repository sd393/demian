import { getInvestorDashboardData } from "@/lib/queries"
import { redirect } from "next/navigation"
import { InvestorDashboardClient } from "./client"

export default async function InvestorDashboard() {
  const data = await getInvestorDashboardData()

  if (!data) {
    redirect("/auth/login")
  }

  // If investor hasn't completed onboarding, send them there
  if (!data.investorProfile) {
    redirect("/investor/onboarding")
  }

  // Convert Set to array for serialization
  const savedIdsArray = Array.from(data.savedIds)

  return (
    <InvestorDashboardClient
      startups={data.startups}
      savedIds={savedIdsArray}
    />
  )
}
