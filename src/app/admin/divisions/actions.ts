'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function deleteDivision(id: number) {
  const supabaseAdmin = createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('divisions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting division:', error);
    // Return friendly message if it's a foreign key constraint error
    if (error.code === '23503') {
      return { success: false, error: 'Tidak dapat menghapus divisi ini karena masih ada pengurus atau data yang terhubung dengannya.' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/divisions');
  return { success: true };
}
