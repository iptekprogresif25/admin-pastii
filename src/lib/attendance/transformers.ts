import {
  DB_STATUS,
  UNKNOWN_DIVISION_ID,
  UNKNOWN_DIVISION_NAME,
} from './constants';
import type {
  DbEvent,
  DbProfile,
  DbDivision,
  DbAttendanceRecord,
  DbAttendanceStat,
  AttendanceStatus,
  AttendanceStats,
  MemberStat,
  AttendeeRow,
  DivisionGroup,
  EventGroupData,
  DivisionGroupData,
  IndividualGroupData,
} from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalizes raw DB status string to the canonical UI status. */
function normalizeStatus(raw: string): AttendanceStatus {
  const s = raw?.toUpperCase();
  if (s === DB_STATUS.PRESENT) return 'PRESENT';
  if (s === DB_STATUS.LATE) return 'LATE';
  if (s === DB_STATUS.PERMIT || s === DB_STATUS.EXCUSED) return 'EXCUSED';
  return 'ABSENT';
}

/** Resolves division name from id using the map. */
function divisionName(id: number | null, map: Map<number, string>): string {
  if (!id) return UNKNOWN_DIVISION_NAME;
  return map.get(id) ?? UNKNOWN_DIVISION_NAME;
}

/** Sums attendance statuses from an array of raw stat rows. */
function sumStats(records: DbAttendanceStat[]): {
  present: number;
  late: number;
  excused: number;
  permitNotes: string[];
} {
  let present = 0, late = 0, excused = 0;
  const permitNotes: string[] = [];
  for (const r of records) {
    const s = r.status?.toUpperCase();
    if (s === DB_STATUS.PRESENT) present++;
    else if (s === DB_STATUS.LATE) late++;
    else if (s === DB_STATUS.PERMIT || s === DB_STATUS.EXCUSED) {
      excused++;
      if (r.notes) permitNotes.push(r.notes);
    }
  }
  return { present, late, excused, permitNotes };
}

// ─── Event view transformer ───────────────────────────────────────────────────

export function buildEventGroupedData(
  events: DbEvent[],
  attendanceRows: DbAttendanceRecord[],
  allProfiles: DbProfile[],
  divisionsMap: Map<number, string>,
): EventGroupData[] {
  // Index attendance by event for O(1) lookup
  const byEvent = new Map<number, DbAttendanceRecord[]>();
  for (const row of attendanceRows) {
    const list = byEvent.get(row.event_id) ?? [];
    list.push(row);
    byEvent.set(row.event_id, list);
  }

  // Index profiles by id
  const profilesMap = new Map(allProfiles.map(p => [p.id, p]));

  return events.map(event => {
    const eventAttendance = byEvent.get(event.id) ?? [];
    const attendedIds = new Set(eventAttendance.map(a => a.user_id));
    const divMap = new Map<number, DivisionGroup>();

    // Attended rows
    for (const att of eventAttendance) {
      const profile = profilesMap.get(att.user_id);
      const divId = profile?.division_id ?? UNKNOWN_DIVISION_ID;
      const divGroup = divMap.get(divId) ?? {
        division_id: divId,
        division_name: divisionName(divId, divisionsMap),
        attendees: [],
      };
      divGroup.attendees.push({
        id: att.id,
        user_id: att.user_id,
        user_name: profile?.full_name ?? 'Unknown User',
        user_nim: profile?.nim ?? '-',
        avatar_url: profile?.avatar_url ?? null,
        check_in_time: att.check_in_time,
        check_out_time: att.check_out_time,
        status: normalizeStatus(att.status),
        notes: att.notes,
        is_absent: false,
      });
      divMap.set(divId, divGroup);
    }

    // Absent rows (all profiles not in attended set)
    for (const profile of allProfiles) {
      if (attendedIds.has(profile.id)) continue;
      const divId = profile.division_id ?? UNKNOWN_DIVISION_ID;
      const divGroup = divMap.get(divId) ?? {
        division_id: divId,
        division_name: divisionName(divId, divisionsMap),
        attendees: [],
      };
      divGroup.attendees.push({
        id: null,
        user_id: profile.id,
        user_name: profile.full_name ?? 'Unknown User',
        user_nim: profile.nim ?? '-',
        avatar_url: profile.avatar_url ?? null,
        check_in_time: null,
        check_out_time: null,
        status: 'ABSENT',
        notes: null,
        is_absent: true,
      });
      divMap.set(divId, divGroup);
    }

    // Sort attendees: attended first (alpha), then absent (alpha)
    for (const group of divMap.values()) {
      group.attendees.sort((a, b) => {
        if (a.is_absent !== b.is_absent) return a.is_absent ? 1 : -1;
        return (a.user_name).localeCompare(b.user_name);
      });
    }

    const divisions = [...divMap.values()].sort((a, b) =>
      a.division_name.localeCompare(b.division_name),
    );

    return {
      event_id: event.id,
      event_title: event.title,
      event_date: event.start_time,
      divisions,
    };
  });
}

// ─── Division view transformer ────────────────────────────────────────────────

export function buildDivisionGroupedData(
  paginatedDivisions: DbDivision[],
  profiles: DbProfile[],
  attendanceStats: DbAttendanceStat[],
  totalEventsToCount: number,
): DivisionGroupData[] {
  // Index attendance by user
  const byUser = new Map<string, DbAttendanceStat[]>();
  for (const row of attendanceStats) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  // Group profiles by division id
  const profilesByDiv = new Map<number, DbProfile[]>();
  for (const p of profiles) {
    const divId = p.division_id ?? UNKNOWN_DIVISION_ID;
    const list = profilesByDiv.get(divId) ?? [];
    list.push(p);
    profilesByDiv.set(divId, list);
  }

  return paginatedDivisions.map(division => {
    const divProfiles = profilesByDiv.get(division.id) ?? [];
    let totalPresent = 0, totalLate = 0, totalExcused = 0;

    const members: MemberStat[] = divProfiles.map(user => {
      const records = byUser.get(user.id) ?? [];
      let p = 0, l = 0, e = 0;
      for (const r of records) {
        const s = r.status?.toUpperCase();
        if (s === DB_STATUS.PRESENT) p++;
        else if (s === DB_STATUS.LATE) l++;
        else if (s === DB_STATUS.PERMIT || s === DB_STATUS.EXCUSED) e++;
      }
      totalPresent += p;
      totalLate += l;
      totalExcused += e;

      const rowsFound = p + l + e;
      const absent = Math.max(0, totalEventsToCount - rowsFound);
      const attendance_rate =
        totalEventsToCount > 0
          ? Math.round(((p + l) / totalEventsToCount) * 100)
          : 0;

      return {
        user_id: user.id,
        user_name: user.full_name ?? 'Unknown',
        avatar_url: user.avatar_url ?? null,
        present: p,
        late: l,
        excused: e,
        absent,
        attendance_rate,
      };
    });

    // Highest attendance rate first
    members.sort((a, b) => b.attendance_rate - a.attendance_rate);

    const totalExpected = divProfiles.length * totalEventsToCount;
    const totalFound = totalPresent + totalLate + totalExcused;
    const absent = Math.max(0, totalExpected - totalFound);

    return {
      division_id: division.id,
      division_name: division.name,
      logo_url: division.logo_url ?? null,
      stats: {
        present: totalPresent,
        late: totalLate,
        excused: totalExcused,
        absent,
        total: totalExpected,
      },
      members,
    };
  });
}

// ─── Individual view transformer ──────────────────────────────────────────────

export function buildIndividualGroupedData(
  profiles: DbProfile[],
  attendanceStats: DbAttendanceStat[],
  divisionsMap: Map<number, string>,
  totalEventsToCount: number,
): IndividualGroupData[] {
  // Index attendance by user
  const byUser = new Map<string, DbAttendanceStat[]>();
  for (const row of attendanceStats) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  return profiles.map(profile => {
    const records = byUser.get(profile.id) ?? [];
    const { present, late, excused, permitNotes } = sumStats(records);
    const totalFound = present + late + excused;
    const absent = Math.max(0, totalEventsToCount - totalFound);

    return {
      user_id: profile.id,
      user_name: profile.full_name ?? 'Unknown User',
      user_nim: profile.nim ?? '-',
      avatar_url: profile.avatar_url ?? null,
      division_name: divisionName(profile.division_id, divisionsMap),
      stats: { present, late, excused, absent, total: totalEventsToCount },
      permit_notes: permitNotes,
    };
  });
}
