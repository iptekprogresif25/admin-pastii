import type { AttendanceStatus } from './constants';
export type { AttendanceStatus };

// ─── Raw DB row types ────────────────────────────────────────────────────────

export interface DbEvent {
  id: number;
  title: string;
  start_time: string;
}

export interface DbProfile {
  id: string;
  full_name: string | null;
  nim: string | null;
  division_id: number | null;
  avatar_url: string | null;
}

export interface DbDivision {
  id: number;
  name: string;
  logo_url: string | null;
}

export interface DbAttendanceRecord {
  id: number;
  user_id: string;
  event_id: number;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
  notes: string | null;
}

export interface DbAttendanceStat {
  user_id: string;
  status: string;
  notes?: string | null;
}

// ─── UI data types ────────────────────────────────────────────────────────────

export interface AttendanceStats {
  present: number;
  late: number;
  excused: number;
  absent: number;
  total: number;
}

export interface MemberStat {
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  present: number;
  late: number;
  excused: number;
  absent: number;
  attendance_rate: number;
}

export interface AttendeeRow {
  id: number | null;
  user_id: string;
  user_name: string;
  user_nim: string;
  avatar_url: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  status: AttendanceStatus;
  notes: string | null;
  is_absent: boolean;
}

export interface DivisionGroup {
  division_id: number;
  division_name: string;
  attendees: AttendeeRow[];
}

export interface EventGroupData {
  event_id: number;
  event_title: string;
  event_date: string;
  divisions: DivisionGroup[];
}

export interface DivisionGroupData {
  division_id: number;
  division_name: string;
  logo_url: string | null;
  stats: AttendanceStats;
  members: MemberStat[];
}

export interface IndividualGroupData {
  user_id: string;
  user_name: string;
  user_nim: string;
  avatar_url: string | null;
  division_name: string;
  stats: AttendanceStats;
  permit_notes: string[];
}

// ─── Events list for filter dropdown ─────────────────────────────────────────

export interface EventFilterItem {
  id: number;
  title: string;
}
