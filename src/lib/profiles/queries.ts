import { cache } from "react";
import { createAdminClient } from "@/utils/supabase/admin";

function getAdmin() {
  return createAdminClient();
}

// ─── React Cached: Paginated profiles for Profiles Management ─────────────────
export const getProfilesForManagement = cache(async (
  page: number,
  itemsPerPage: number,
  searchQuery: string = ""
) => {
  const db = getAdmin();
  let queryBuilder = db
    .from("profiles")
    .select(`
      id,
      full_name,
      role,
      division_id,
      is_active,
      division:divisions!profiles_division_id_fkey(name)
    `, { count: "exact" });

  if (searchQuery) {
    queryBuilder = queryBuilder.ilike("full_name", `%${searchQuery}%`);
  }

  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const { data, count, error } = await queryBuilder
    .order("full_name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Error fetching profiles:", error);
  }

  return {
    profiles: data || [],
    totalCount: count || 0,
  };
});
