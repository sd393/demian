import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Service-role client — server-only, never expose to the browser.
// Used for admin operations like creating profiles on signup and deleting accounts.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
