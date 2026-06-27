'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath, updateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/constants';

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
  updateTag(CACHE_TAGS.PROFILES);
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
  updateTag(CACHE_TAGS.PROFILES);
  return { success: true };
}

export async function updateProfile(id: string, data: any) {
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
  updateTag(CACHE_TAGS.PROFILES);
  return { success: true };
}
