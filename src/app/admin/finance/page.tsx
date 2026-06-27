import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import FinanceClient from "./FinanceClient";
import { getTransactions } from "@/lib/finance/queries";
import { getCachedDivisions } from "@/lib/divisions/queries";

export const metadata = {
  title: "Keuangan Divisi | Admin Pastii",
  description: "Manajemen keuangan divisi",
};

export default async function FinancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch divisions using unstable_cache (shared reference data)
  const divisions = await getCachedDivisions();

  // Fetch transactions using React cache (deduplicated per render)
  const transactions = await getTransactions();

  return <FinanceClient transactions={transactions} divisions={divisions} />;
}
