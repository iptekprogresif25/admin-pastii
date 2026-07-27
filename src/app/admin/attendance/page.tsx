import React from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AttendanceTabs from '@/components/tables/AttendanceTabs';
import GroupedByEventView from '@/components/tables/GroupedByEventView';
import GroupedByDivisionView from '@/components/tables/GroupedByDivisionView';
import GroupedByIndividualView from '@/components/tables/GroupedByIndividualView';
import {
  getCachedEventsList,
  getCachedDivisions,
  getCachedActiveProfiles,
  getPaginatedEvents,
  getPaginatedDivisions,
  getPaginatedProfiles,
  getAttendanceForEvents,
  getAttendanceStatsForUsers,
} from '@/lib/attendance/queries';
import {
  buildEventGroupedData,
  buildDivisionGroupedData,
  buildIndividualGroupedData,
} from '@/lib/attendance/transformers';
import type { EventGroupData, DivisionGroupData, IndividualGroupData } from '@/lib/attendance/types';

// ─── Page config ──────────────────────────────────────────────────────────────
// Attendance data changes in real-time (check-ins). Force dynamic rendering.
export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE: Record<string, number> = {
  event: 5,
  division: 12,
  individual: 12,
};

export default async function AttendancePage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const view = typeof searchParams?.view === 'string' ? searchParams.view : 'event';
  const page = typeof searchParams?.page === 'string' ? Math.max(1, parseInt(searchParams.page, 10)) : 1;
  const eventIdParam = typeof searchParams?.eventId === 'string' ? searchParams.eventId : 'all';
  const eventIdFilter = eventIdParam !== 'all' ? parseInt(eventIdParam, 10) : undefined;

  const itemsPerPage = ITEMS_PER_PAGE[view] ?? 12;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Cached: events list (used by the filter dropdown on every view)
  const allEventsList = await getCachedEventsList();
  const totalEventsToCount = eventIdFilter !== undefined ? 1 : allEventsList.length;

  let content: React.ReactNode = null;

  // ─── VIEW 1: PER KEGIATAN ──────────────────────────────────────────────────
  if (view === 'event') {
    const [{ events, total }, allProfiles, allDivisions] = await Promise.all([
      getPaginatedEvents(from, to),
      getCachedActiveProfiles(),
      getCachedDivisions(),
    ]);

    const divisionsMap = new Map(allDivisions.map(d => [d.id, d.name]));
    let groupedData: EventGroupData[] = [];

    if (events.length > 0) {
      const eventIds = events.map(e => e.id);
      const attendanceRows = await getAttendanceForEvents(eventIds);
      groupedData = buildEventGroupedData(events, attendanceRows, allProfiles, divisionsMap);
    }

    content = (
      <GroupedByEventView
        groupedData={groupedData}
        totalCount={total}
        currentPage={page}
        itemsPerPage={itemsPerPage}
      />
    );

    // ─── VIEW 2: PER DIVISI ────────────────────────────────────────────────────
  } else if (view === 'division') {
    const { divisions: paginatedDivisions, total } = await getPaginatedDivisions(from, to);
    let groupedData: DivisionGroupData[] = [];

    if (paginatedDivisions.length > 0) {
      const divisionIds = paginatedDivisions.map(d => d.id);
      // Profiles only for divisions on this page — narrower query
      const { data: profilesData } = await (await import('@/utils/supabase/admin'))
        .createAdminClient()
        .from('profiles')
        .select('id, full_name, avatar_url, division_id, nim')
        .in('division_id', divisionIds);

      const profiles = profilesData ?? [];
      const userIds = profiles.map((p) => p.id);
      const attendanceStats = await getAttendanceStatsForUsers(userIds, eventIdFilter);

      groupedData = buildDivisionGroupedData(
        paginatedDivisions,
        profiles,
        attendanceStats,
        totalEventsToCount,
      );
    }

    content = (
      <GroupedByDivisionView
        groupedData={groupedData}
        totalCount={total}
        currentPage={page}
        itemsPerPage={itemsPerPage}
      />
    );

    // ─── VIEW 3: PER INDIVIDU ──────────────────────────────────────────────────
  } else if (view === 'individual') {
    const [{ profiles, total }, allDivisions] = await Promise.all([
      getPaginatedProfiles(from, to),
      getCachedDivisions(),
    ]);

    const divisionsMap = new Map(allDivisions.map(d => [d.id, d.name]));
    let groupedData: IndividualGroupData[] = [];

    if (profiles.length > 0) {
      const userIds = profiles.map(p => p.id);
      const attendanceStats = await getAttendanceStatsForUsers(userIds, eventIdFilter);
      groupedData = buildIndividualGroupedData(profiles, attendanceStats, divisionsMap, totalEventsToCount);
    }

    content = (
      <GroupedByIndividualView
        groupedData={groupedData}
        totalCount={total}
        currentPage={page}
        itemsPerPage={itemsPerPage}
      />
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Analitik & Data Presensi" />
      <div className="space-y-6">
        <AttendanceTabs
          currentView={view}
          eventsList={allEventsList}
          currentEventId={eventIdParam}
        />
        {content}
      </div>
    </div>
  );
}
