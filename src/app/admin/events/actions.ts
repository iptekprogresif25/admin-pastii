'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath, updateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/constants';

export async function softDeleteEvent(id: number) {
  const supabaseAdmin = createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('events')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error soft deleting event:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/events');
  updateTag(CACHE_TAGS.EVENTS);
  return { success: true };
}

export async function toggleEventStatus(id: number, currentStatus: boolean) {
  const supabaseAdmin = createAdminClient();
  const newStatus = !currentStatus;
  
  const { error } = await supabaseAdmin
    .from('events')
    .update({ is_active: newStatus })
    .eq('id', id);

  if (error) {
    console.error('Error toggling event status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/events');
  updateTag(CACHE_TAGS.EVENTS);
  return { success: true };
}
