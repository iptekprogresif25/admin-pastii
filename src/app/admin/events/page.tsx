import React from 'react';
import { createClient } from '@/utils/supabase/server';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import EventsTable from '@/components/tables/EventsTable';
import { getEventsForManagement } from '@/lib/events/queries';

export default async function EventsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  // Parse search params
  const query = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const itemsPerPage = 5; // Konsisten dengan pagination sebelumnya

  // Verifikasi auth standard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Optionally handle redirect
  }
  
  // Fetch using cached Data Access Layer
  const { events, totalCount } = await getEventsForManagement(page, itemsPerPage, query);

  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Kegiatan" />
      
      <div className="space-y-6">
        <EventsTable 
          events={events || []} 
          totalCount={totalCount || 0}
          currentPage={page}
          itemsPerPage={itemsPerPage}
          initialSearch={query}
        />
      </div>
    </div>
  );
}
