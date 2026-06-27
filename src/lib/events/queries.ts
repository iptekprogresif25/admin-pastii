import { cache } from "react";
import { createAdminClient } from "@/utils/supabase/admin";

function getAdmin() {
  return createAdminClient();
}

// ─── React Cached: Paginated events for Events Management ─────────────────────
export const getEventsForManagement = cache(async (
  page: number,
  itemsPerPage: number,
  searchQuery: string = ""
) => {
  const db = getAdmin();
  let queryBuilder = db
    .from("events")
    .select("id, title, start_time, end_time, type, location_id, is_active", { count: "exact" });

  if (searchQuery) {
    queryBuilder = queryBuilder.or(`title.ilike.%${searchQuery}%,type.ilike.%${searchQuery}%`);
  }

  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const { data, count, error } = await queryBuilder
    .order("start_time", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching events:", error);
  }

  return {
    events: data || [],
    totalCount: count || 0,
  };
});
