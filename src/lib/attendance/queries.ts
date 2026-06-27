import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { CACHE_TAGS, CACHE_TTL } from '@/lib/constants';
import type {
  DbEvent,
  DbProfile,
  DbDivision,
  DbAttendanceRecord,
  DbAttendanceStat,
  EventFilterItem,
} from './types';

// ─── Singleton Supabase client per module load ────────────────────────────────
// createClient is cheap but we avoid recreating it on every call.
function getAdmin() {
  return createAdminClient();
}

// ─── Cached: Events list (for filter dropdown + count) ────────────────────────
// Cached because the list of events changes only when a new event is created.
export const getCachedEventsList = unstable_cache(
  async (): Promise<EventFilterItem[]> => {
    const { data } = await getAdmin()
      .from('events')
      .select('id, title')
      .order('start_time', { ascending: false });
    return (data ?? []) as EventFilterItem[];
  },
  [CACHE_TAGS.EVENTS],
  { tags: [CACHE_TAGS.EVENTS], revalidate: CACHE_TTL.SHORT },
);

// ─── Cached: All divisions ────────────────────────────────────────────────────
export const getCachedDivisions = unstable_cache(
  async (): Promise<DbDivision[]> => {
    const { data } = await getAdmin()
      .from('divisions')
      .select('id, name, logo_url')
      .order('name', { ascending: true });
    return (data ?? []) as DbDivision[];
  },
  [CACHE_TAGS.DIVISIONS],
  { tags: [CACHE_TAGS.DIVISIONS], revalidate: CACHE_TTL.MEDIUM },
);

// ─── Cached: All active profiles ─────────────────────────────────────────────
export const getCachedActiveProfiles = unstable_cache(
  async (): Promise<DbProfile[]> => {
    const { data } = await getAdmin()
      .from('profiles')
      .select('id, full_name, nim, division_id, avatar_url')
      .eq('is_active', true);
    return (data ?? []) as DbProfile[];
  },
  [CACHE_TAGS.PROFILES],
  { tags: [CACHE_TAGS.PROFILES], revalidate: CACHE_TTL.SHORT },
);

// ─── React Cached: Paginated events (for event view) ────────────────────────────
// These carry child attendance data that changes in real-time.
export const getPaginatedEvents = cache(async (
  from: number,
  to: number,
): Promise<{ events: DbEvent[]; total: number }> => {
  const db = getAdmin();
  const [countResult, dataResult] = await Promise.all([
    db.from('events').select('id', { count: 'exact', head: true }),
    db
      .from('events')
      .select('id, title, start_time')
      .order('start_time', { ascending: false })
      .range(from, to),
  ]);
  return {
    events: (dataResult.data ?? []) as DbEvent[],
    total: countResult.count ?? 0,
  };
});

// ─── React Cached: Paginated divisions (for division view) ──────────────────────
export const getPaginatedDivisions = cache(async (
  from: number,
  to: number,
): Promise<{ divisions: DbDivision[]; total: number }> => {
  const db = getAdmin();
  const [countResult, dataResult] = await Promise.all([
    db.from('divisions').select('id', { count: 'exact', head: true }),
    db
      .from('divisions')
      .select('id, name, logo_url')
      .order('name', { ascending: true })
      .range(from, to),
  ]);
  return {
    divisions: (dataResult.data ?? []) as DbDivision[],
    total: countResult.count ?? 0,
  };
});

// ─── React Cached: Paginated profiles (for individual view) ─────────────────────
export const getPaginatedProfiles = cache(async (
  from: number,
  to: number,
): Promise<{ profiles: DbProfile[]; total: number }> => {
  const db = getAdmin();
  const [countResult, dataResult] = await Promise.all([
    db.from('profiles').select('id', { count: 'exact', head: true }),
    db
      .from('profiles')
      .select('id, full_name, nim, division_id, avatar_url')
      .order('full_name', { ascending: true })
      .range(from, to),
  ]);
  return {
    profiles: (dataResult.data ?? []) as DbProfile[],
    total: countResult.count ?? 0,
  };
});

// ─── React Cached: Attendance rows for specific events ─────────────────────────
export const getAttendanceForEvents = cache(async (
  eventIds: number[],
): Promise<DbAttendanceRecord[]> => {
  if (eventIds.length === 0) return [];
  const { data } = await getAdmin()
    .from('attendance')
    .select('id, user_id, event_id, check_in_time, check_out_time, status, notes')
    .in('event_id', eventIds);
  return (data ?? []) as DbAttendanceRecord[];
});

// ─── React Cached: Attendance stats for specific users ─────────────────────────
export const getAttendanceStatsForUsers = cache(async (
  userIds: string[],
  eventIdFilter?: number,
): Promise<DbAttendanceStat[]> => {
  if (userIds.length === 0) return [];
  let query = getAdmin()
    .from('attendance')
    .select('user_id, status, notes')
    .in('user_id', userIds);
  if (eventIdFilter !== undefined) {
    query = query.eq('event_id', eventIdFilter);
  }
  const { data } = await query;
  return (data ?? []) as DbAttendanceStat[];
});
