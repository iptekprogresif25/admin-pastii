import React from 'react';
import { createAdminClient } from '@/utils/supabase/admin';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import DivisionsTable from '@/components/tables/DivisionsTable';

export default async function DivisionsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  // Parse search params
  const query = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const itemsPerPage = 5; 

  // Gunakan admin client (bypassing RLS)
  const supabaseAdmin = createAdminClient();

  // Siapkan query
  let queryBuilder = supabaseAdmin
    .from('divisions')
    .select('id, name, description', { count: 'exact' });

  // Tambahkan filter pencarian (ilike)
  if (query) {
    queryBuilder = queryBuilder.ilike('name', `%${query}%`);
  }

  // Tambahkan paginasi (.range)
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  
  const { data: divisions, count, error } = await queryBuilder
    .order('name', { ascending: true })
    .range(from, to);

  if (error) {
    console.error('Error fetching divisions:', error);
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Divisi" />
      
      <div className="space-y-6">
        <DivisionsTable 
          divisions={divisions || []} 
          totalCount={count || 0}
          currentPage={page}
          itemsPerPage={itemsPerPage}
          initialSearch={query}
        />
      </div>
    </div>
  );
}
