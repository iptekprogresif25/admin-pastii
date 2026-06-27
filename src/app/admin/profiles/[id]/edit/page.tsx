import React from 'react';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/utils/supabase/admin';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import EditProfileForm from './EditProfileForm';

export default async function EditProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabaseAdmin = createAdminClient();

  // Ambil data profil
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Ambil data divisi untuk opsi select
  const { data: divisions } = await supabaseAdmin
    .from('divisions')
    .select('id, name')
    .order('name', { ascending: true });

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Pengurus" />
      <div className="space-y-6">
        <EditProfileForm profile={profile} divisions={divisions || []} />
      </div>
    </div>
  );
}
