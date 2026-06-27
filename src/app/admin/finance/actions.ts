"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { FinanceFormData } from "@/lib/finance/types";

export async function addTransaction(data: FinanceFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("division_kas").insert({
    division_id: data.division_id,
    label: data.label,
    amount: data.amount,
    type: data.type,
    date: data.date,
    created_by: user.id,
  });

  if (error) {
    console.error("Error adding transaction:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin"); // Revalidate dashboard as it contains finance overview
  return { success: true };
}

export async function updateTransaction(id: string, data: FinanceFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("division_kas").update({
    division_id: data.division_id,
    label: data.label,
    amount: data.amount,
    type: data.type,
    date: data.date,
  }).eq("id", id);

  if (error) {
    console.error("Error updating transaction:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("division_kas").delete().eq("id", id);

  if (error) {
    console.error("Error deleting transaction:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin");
  return { success: true };
}
