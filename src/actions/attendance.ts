'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { AttendanceRecord } from '@/components/pdf/AttendanceReportPDF';
import { unstable_cache } from 'next/cache';

// Fungsi internal yang di-cache untuk mengambil data dari database
const fetchAttendanceData = unstable_cache(
  async (eventId: number) => {
    const supabaseAdmin = createAdminClient();
    const [
      { data: attendances },
      { data: profiles },
      { data: divisions }
    ] = await Promise.all([
      supabaseAdmin.from('attendance').select('*').eq('event_id', eventId),
      supabaseAdmin.from('profiles').select('id, full_name, division_id').not('division_id', 'is', null),
      supabaseAdmin.from('divisions').select('id, name')
    ]);

    return { attendances, profiles, divisions };
  },
  ['attendance-report-data'], // Cache key prefix
  { revalidate: 60, tags: ['attendance'] } // Cache selama 60 detik
);

export async function getAttendanceReport(eventId: number): Promise<AttendanceRecord[]> {
  // Menggunakan fungsi yang di-cache
  const { attendances, profiles, divisions } = await fetchAttendanceData(eventId);

  const divisionMap = new Map(divisions?.map(d => [d.id, d.name]) || []);
  const eventAttendances = attendances || [];

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  };

  const mapStatus = (status: string | undefined | null) => {
    if (!status) return 'Tidak Hadir';
    switch (status.toUpperCase()) {
      case 'PRESENT': return 'Hadir';
      case 'LATE': return 'Terlambat';
      case 'PERMIT':
      case 'EXCUSED': return 'Izin / Sakit';
      case 'ABSENT': return 'Tidak Hadir';
      default: return status;
    }
  };

  // Map over all profiles to generate the records
  let records: AttendanceRecord[] = (profiles || []).map(profile => {
    const attendanceRecord = eventAttendances.find(a => a.user_id === profile.id);
    const divisionName = profile.division_id ? divisionMap.get(profile.division_id) : '-';

    return {
      id: attendanceRecord?.id?.toString() || `empty-${profile.id}`,
      name: profile.full_name || 'Tanpa Nama',
      division: divisionName || '-',
      timeIn: attendanceRecord?.created_at ? formatTime(attendanceRecord.created_at) : '-',
      status: mapStatus(attendanceRecord?.status),
      notes: attendanceRecord?.notes || ''
    };
  });

  // Group by division (Sort by division name first, then by member name)
  records = records.sort((a, b) => {
    if (a.division === b.division) {
      return a.name.localeCompare(b.name);
    }
    return a.division.localeCompare(b.division);
  });

  return records;
}
