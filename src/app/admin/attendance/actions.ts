'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function deleteAttendance(id: number) {
  const supabaseAdmin = createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('attendance')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting attendance:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/attendance');
  return { success: true };
}
