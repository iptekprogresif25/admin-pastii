import React from 'react';
import { createClient } from '@/utils/supabase/server';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ProfilesTable from '@/components/tables/ProfilesTable';
import { getProfilesForManagement } from '@/lib/profiles/queries';

export default async function ProfilesPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  // Parse search params
  const query = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const itemsPerPage = 10; // Konsisten dengan pagination sebelumnya

  // Verifikasi auth standard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Optionally handle redirect
  }
  
  // Fetch using cached Data Access Layer
  const { profiles, totalCount } = await getProfilesForManagement(page, itemsPerPage, query);

  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Pengurus" />
      
      <div className="space-y-6">
        <ProfilesTable 
          profiles={(profiles as any) || []} 
          totalCount={totalCount || 0}
          currentPage={page}
          itemsPerPage={itemsPerPage}
          initialSearch={query}
        />
      </div>
    </div>
  );
}
