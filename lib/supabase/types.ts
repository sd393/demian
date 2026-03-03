export type UserRole = "founder" | "investor"

export interface Profile {
  id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Startup {
  id: string
  founder_id: string
  startup_name: string
  founder_name: string
  school: string
  email: string
  sector: string | null
  stage: string | null
  website: string | null
  one_liner: string
  problem: string
  solution: string
  traction: string | null
  fundraising: string | null
  deck_path: string | null
  location: string | null
  tags: string[] | null
  pitch_score: number | null
  fit_score: number | null
  percentile: number | null
  strengths: string[] | null
  weaknesses: string[] | null
  improvements: Record<string, unknown> | null
  summary: string | null
  created_at: string
  updated_at: string
}

export interface InvestorProfile {
  id: string
  investor_id: string
  investor_name: string
  firm_name: string
  role: string | null
  linkedin_url: string | null
  sectors: string[]
  stages: string[] | null
  check_size_min: string | null
  check_size_max: string | null
  geography: string[] | null
  thesis: string | null
  not_interested: string | null
  created_at: string
  updated_at: string
}

export interface PitchVersion {
  id: string
  startup_id: string
  version: number
  deck_path: string | null
  score: number | null
  uploaded_at: string
}

export interface SavedStartup {
  investor_id: string
  startup_id: string
  created_at: string
}

export interface StartupView {
  investor_id: string
  startup_id: string
  viewed_at: string
}

// Database type map for Supabase client generics
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at" | "updated_at">
        Update: Partial<Omit<Profile, "id" | "created_at">>
      }
      startups: {
        Row: Startup
        Insert: Omit<Startup, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Startup, "id" | "founder_id" | "created_at">>
      }
      investor_profiles: {
        Row: InvestorProfile
        Insert: Omit<InvestorProfile, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<InvestorProfile, "id" | "investor_id" | "created_at">>
      }
      pitch_versions: {
        Row: PitchVersion
        Insert: Omit<PitchVersion, "id" | "uploaded_at">
        Update: Partial<Omit<PitchVersion, "id" | "startup_id">>
      }
      saved_startups: {
        Row: SavedStartup
        Insert: Omit<SavedStartup, "created_at">
        Update: never
      }
      startup_views: {
        Row: StartupView
        Insert: Omit<StartupView, "viewed_at">
        Update: never
      }
    }
  }
}
