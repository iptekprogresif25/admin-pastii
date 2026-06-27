// Attendance status values as stored in the database
export const DB_STATUS = {
  PRESENT: 'PRESENT',
  LATE: 'LATE',
  PERMIT: 'PERMIT',
  EXCUSED: 'EXCUSED', // legacy alias for PERMIT
  ABSENT: 'ABSENT',   // synthetic — not stored in DB
} as const;

// Normalized UI status (PERMIT is always mapped to EXCUSED)
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT';

export const UNKNOWN_DIVISION_ID = 0;
export const UNKNOWN_DIVISION_NAME = 'Tanpa Divisi';


