'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

interface Profile {
  id: string;
  full_name: string;
  role: 'ADMIN' | 'KOORDINATOR' | 'MEMBER';
  division_id: number | null;
  nim: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  is_active: boolean;
}

export async function softDeleteProfile(id: string) {
  const supabaseAdmin = createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: false, status: 'suspended' })
    .eq('id', id);

  if (error) {
    console.error('Error soft deleting profile:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/profiles');
  return { success: true };
}

export async function toggleProfileStatus(id: string, currentStatus: boolean) {
  const supabaseAdmin = createAdminClient();
  const newStatus = !currentStatus;
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: newStatus, status: newStatus ? 'active' : 'suspended' })
    .eq('id', id);

  if (error) {
    console.error('Error toggling profile status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/profiles');
  return { success: true };
}

export async function updateProfile(id: string, data: Partial<Profile>): Promise<{ success: boolean; error?: string }> {
  const supabaseAdmin = createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/profiles');
  revalidatePath(`/admin/profiles/${id}/edit`);
  return { success: true };
}
