import { cache } from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { FinanceTransaction } from "./types";

function getAdmin() {
  return createAdminClient();
}

// ─── React Cached: Fetch all finance transactions ─────────────────────────────
export const getTransactions = cache(async (): Promise<FinanceTransaction[]> => {
  const db = getAdmin();
  const { data, error } = await db
    .from("division_kas")
    .select("id, division_id, created_by, label, amount, type, date, divisions(name)")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return (data || []).map((tx) => ({
    ...tx,
    divisions: Array.isArray(tx.divisions) ? tx.divisions[0] : tx.divisions,
  })) as FinanceTransaction[];
});
