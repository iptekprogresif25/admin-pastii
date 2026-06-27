import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/constants";
import { DbDivision } from "@/lib/attendance/types";

function getAdmin() {
  return createAdminClient();
}

// ─── Unstable Cached: All divisions (for dropdowns) ───────────────────────────
export const getCachedDivisions = unstable_cache(
  async (): Promise<DbDivision[]> => {
    const { data } = await getAdmin()
      .from("divisions")
      .select("id, name, logo_url")
      .order("name", { ascending: true });
    return (data ?? []) as DbDivision[];
  },
  [CACHE_TAGS.DIVISIONS],
  { tags: [CACHE_TAGS.DIVISIONS], revalidate: CACHE_TTL.MEDIUM }
);

// ─── React Cached: Paginated divisions (for division view) ──────────────────────
export const getPaginatedDivisions = cache(async (
  from: number,
  to: number,
): Promise<{ divisions: DbDivision[]; total: number }> => {
  const db = getAdmin();
  const [countResult, dataResult] = await Promise.all([
    db.from("divisions").select("id", { count: "exact", head: true }),
    db
      .from("divisions")
      .select("id, name, logo_url")
      .order("name", { ascending: true })
      .range(from, to),
  ]);
  return {
    divisions: (dataResult.data ?? []) as DbDivision[],
    total: countResult.count ?? 0,
  };
});
