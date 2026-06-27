'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Pagination from '@/components/tables/Pagination';
import { Clock, Trash2, MoreVertical, Calendar, Users, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { deleteAttendance } from '@/app/admin/attendance/actions';
import dynamic from 'next/dynamic';
import { UserCircleIcon } from '@/icons';
import type { EventGroupData, AttendeeRow } from '@/lib/attendance/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface GroupedByEventViewProps {
  groupedData: EventGroupData[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function GroupedByEventView({ groupedData, totalCount, currentPage, itemsPerPage }: GroupedByEventViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [deleteModalRecord, setDeleteModalRecord] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);

  useEffect(() => {
    if (groupedData.length > 0 && !groupedData.find(e => e.event_id === activeEventId)) {
      setActiveEventId(groupedData[0].event_id);
    }
  }, [groupedData, activeEventId]);

  const toggleDropdown = (id: number) => openDropdownId === id ? setOpenDropdownId(null) : setOpenDropdownId(id);

  const handleDelete = async () => {
    if (!deleteModalRecord) return;
    setIsDeleting(true);
    const result = await deleteAttendance(deleteModalRecord.id);
    setIsDeleting(false);
    if (result.success) setDeleteModalRecord(null);
    else alert('Gagal menghapus presensi: ' + result.error);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getStatusBadge = (status: string | null) => {
    const s = status?.toUpperCase() || 'UNKNOWN';
    switch (s) {
      case 'PRESENT': return <Badge color="success">Hadir</Badge>;
      case 'LATE': return <Badge color="warning">Terlambat</Badge>;
      case 'EXCUSED': return <Badge color="info">Izin</Badge>;
      case 'ABSENT': return <Badge color="error">Alpa</Badge>;
      default: return <Badge color="light">{status || '-'}</Badge>;
    }
  };

  const activeEvent = groupedData.find(e => e.event_id === activeEventId);

  // Compute event-level stats from nested divisions
  const eventStats = useMemo(() => {
    if (!activeEvent) return null;
    let present = 0, late = 0, excused = 0, absent = 0;
    activeEvent.divisions.forEach(div => {
      div.attendees.forEach(a => {
        const s = (a.status || '').toUpperCase();
        if (s === 'PRESENT') present++;
        else if (s === 'LATE') late++;
        else if (s === 'EXCUSED') excused++;
        else if (s === 'ABSENT') absent++;
      });
    });
    const total = present + late + excused + absent;
    const attendedRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { present, late, excused, absent, total, attendedRate };
  }, [activeEvent]);

  // Mini donut chart for event summary
  const renderEventChart = () => {
    if (!eventStats || eventStats.total === 0) return null;
    const series = [eventStats.present, eventStats.late, eventStats.excused];
    const options: ApexCharts.ApexOptions = {
      chart: { type: 'donut', fontFamily: 'inherit', background: 'transparent', sparkline: { enabled: false } },
      labels: ['Hadir', 'Terlambat', 'Izin'],
      colors: ['#10B981', '#F59E0B', '#3B82F6'],
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: { show: false },
              value: { show: true, fontSize: '18px', fontWeight: 700, color: '#111827', formatter: (v) => v.toString() },
              total: {
                show: true,
                showAlways: true,
                label: 'Check-in',
                fontSize: '10px',
                color: '#6B7280',
                formatter: () => eventStats.total.toString(),
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      stroke: { show: false },
      tooltip: { enabled: true, theme: 'light', y: { formatter: (v) => v + ' orang' } },
    };
    return (
      <ReactApexChart options={options} series={series} type="donut" height={160} width={160} />
    );
  };

  return (
    <div className="space-y-5">
      {groupedData.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-500 dark:text-gray-400">Tidak ada kegiatan.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">

          {/* Event tab navigation */}
          <div className="border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar">
            <div className="flex w-max min-w-full px-2 pt-2">
              {groupedData.map(event => (
                <button
                  key={event.event_id}
                  onClick={() => setActiveEventId(event.event_id)}
                  className={`flex flex-col px-5 py-3 border-b-2 text-start transition-colors duration-200 ${
                    activeEventId === event.event_id
                      ? 'border-brand-500 text-brand-500 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-500/10 rounded-t-lg'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <span className="font-medium text-sm whitespace-nowrap">{event.event_title}</span>
                  <span className={`text-xs mt-0.5 ${activeEventId === event.event_id ? 'text-brand-400/80' : 'text-gray-400'}`}>
                    {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {activeEvent && (
            <div className="animate-in fade-in duration-300">
              {/* Event header & stats */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-5">
                {/* Left: date + stats */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-medium">
                      {new Date(activeEvent.event_date).toLocaleDateString('id-ID', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                  </div>

                  {eventStats && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {/* Total */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-gray-800 dark:text-white leading-none">{eventStats.total}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Total Anggota</div>
                        </div>
                      </div>
                      {/* Present */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-100 dark:border-success-500/20">
                        <div className="w-8 h-8 rounded-lg bg-success-100 dark:bg-success-500/20 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-success-700 dark:text-success-300 leading-none">{eventStats.present}</div>
                          <div className="text-xs text-success-600/70 mt-0.5">Hadir</div>
                        </div>
                      </div>
                      {/* Late */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-warning-50 dark:bg-warning-500/10 border border-warning-100 dark:border-warning-500/20">
                        <div className="w-8 h-8 rounded-lg bg-warning-100 dark:bg-warning-500/20 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-warning-700 dark:text-warning-300 leading-none">{eventStats.late}</div>
                          <div className="text-xs text-warning-600/70 mt-0.5">Terlambat</div>
                        </div>
                      </div>
                      {/* Excused */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-blue-700 dark:text-blue-300 leading-none">{eventStats.excused}</div>
                          <div className="text-xs text-blue-600/70 mt-0.5">Izin</div>
                        </div>
                      </div>
                      {/* Absent */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-error-50 dark:bg-error-500/10 border border-error-100 dark:border-error-500/20">
                        <div className="w-8 h-8 rounded-lg bg-error-100 dark:bg-error-500/20 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-4 h-4 text-error-600 dark:text-error-400" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-error-700 dark:text-error-300 leading-none">{eventStats.absent}</div>
                          <div className="text-xs text-error-600/70 mt-0.5">Alpa</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attendance rate bar */}
                  {eventStats && eventStats.total > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Distribusi Kehadiran</span>
                        <span className={`font-semibold ${eventStats.attendedRate >= 75 ? 'text-success-500' : eventStats.attendedRate >= 50 ? 'text-warning-500' : 'text-error-500'}`}>
                          {eventStats.attendedRate}% hadir+telat
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex">
                        {eventStats.present > 0 && (
                          <div className="h-full bg-success-500 transition-all" style={{ width: `${(eventStats.present / eventStats.total) * 100}%` }} />
                        )}
                        {eventStats.late > 0 && (
                          <div className="h-full bg-warning-500 transition-all" style={{ width: `${(eventStats.late / eventStats.total) * 100}%` }} />
                        )}
                        {eventStats.excused > 0 && (
                          <div className="h-full bg-blue-500 transition-all" style={{ width: `${(eventStats.excused / eventStats.total) * 100}%` }} />
                        )}
                        {eventStats.absent > 0 && (
                          <div className="h-full bg-error-500 transition-all" style={{ width: `${(eventStats.absent / eventStats.total) * 100}%` }} />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success-500 inline-block" />Hadir</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning-500 inline-block" />Terlambat</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Izin</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error-500 inline-block" />Alpa</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: mini donut chart */}
                {eventStats && eventStats.total > 0 && (
                  <div className="hidden md:flex items-center justify-center shrink-0">
                    {renderEventChart()}
                  </div>
                )}
              </div>

              {/* Single table for all divisions to ensure column alignment */}
              <div className="overflow-x-auto divide-y divide-gray-100 dark:divide-white/[0.05]">
                {activeEvent.divisions.length === 0 ? (
                  <div className="p-8 text-sm text-gray-500 text-center">Belum ada presensi untuk acara ini.</div>
                ) : (
                  <div className="min-w-[700px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Pengurus</TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Waktu Masuk</TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Waktu Keluar</TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Status</TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Keterangan</TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-xs uppercase dark:text-gray-400 w-16">Aksi</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeEvent.divisions.map(division => {
                          // Per-division mini stats
                          let dPresent = 0, dLate = 0, dExcused = 0, dAbsent = 0;
                          division.attendees.forEach(a => {
                            const s = (a.status || '').toUpperCase();
                            if (s === 'PRESENT') dPresent++;
                            else if (s === 'LATE') dLate++;
                            else if (s === 'EXCUSED') dExcused++;
                            else if (s === 'ABSENT') dAbsent++;
                          });

                          return (
                            <React.Fragment key={division.division_id}>
                              {/* Division header row */}
                              <TableRow className="bg-brand-50/40 hover:bg-brand-50/40 dark:bg-brand-900/10 dark:hover:bg-brand-900/10">
                                <TableCell colSpan={6} className="px-5 py-2.5 border-b border-brand-100/40 dark:border-brand-900/20">
                                  <div className="flex items-center justify-between gap-3">
                                    <h4 className="text-sm font-semibold text-brand-600 dark:text-brand-400">{division.division_name}</h4>
                                    <div className="flex items-center gap-2 text-xs shrink-0">
                                      <span className="px-2 py-0.5 rounded bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400 font-medium">{dPresent} Hadir</span>
                                      {dLate > 0 && <span className="px-2 py-0.5 rounded bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400 font-medium">{dLate} Telat</span>}
                                      {dExcused > 0 && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-medium">{dExcused} Izin</span>}
                                      {dAbsent > 0 && <span className="px-2 py-0.5 rounded bg-error-100 text-error-700 dark:bg-error-500/10 dark:text-error-400 font-medium">{dAbsent} Alpa</span>}
                                      <span className="text-gray-400">{division.attendees.length} orang</span>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                                {division.attendees.map((record: AttendeeRow) => (
                                  <TableRow 
                                    key={record.id ?? `absent-${record.user_id}`} 
                                    className={record.is_absent 
                                      ? 'bg-error-50/30 dark:bg-error-500/5 opacity-75' 
                                      : 'hover:bg-gray-50/50 dark:hover:bg-white/[0.02]'
                                    }
                                  >
                                    <TableCell className="px-5 py-3 text-start">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                          {record.avatar_url ? (
                                            <>
                                              <img
                                                src={record.avatar_url}
                                                alt={record.user_name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  e.currentTarget.style.display = 'none';
                                                  const sib = e.currentTarget.nextElementSibling as HTMLElement;
                                                  if (sib) sib.style.display = 'block';
                                                }}
                                              />
                                              <UserCircleIcon className="w-6 h-6 text-gray-400" style={{ display: 'none' }} />
                                            </>
                                          ) : (
                                            <UserCircleIcon className="w-6 h-6 text-gray-400" />
                                          )}
                                        </div>
                                        <div>
                                          <span className={`block font-semibold text-sm ${record.is_absent ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{record.user_name}</span>
                                          <span className="block text-gray-400 text-xs dark:text-gray-500 mt-0.5 font-medium">
                                            {record.user_nim && record.user_nim !== '-' ? record.user_nim : <span className="opacity-0">-</span>}
                                          </span>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-start text-sm text-gray-600 dark:text-gray-300">
                                      {record.check_in_time ? (
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                                          <span>{new Date(record.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-xs">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-start text-sm text-gray-600 dark:text-gray-300">
                                      {record.check_out_time ? (
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                                          <span>{new Date(record.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 italic text-xs">{record.is_absent ? '—' : 'Belum checkout'}</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-start">
                                      {getStatusBadge(record.status)}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-start">
                                      {record.status === 'EXCUSED' && record.notes ? (
                                        <span
                                          className="inline-flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-2 py-1 rounded-lg max-w-[200px] truncate"
                                          title={record.notes}
                                        >
                                          <span className="shrink-0">💬</span>
                                          {record.notes}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400 text-xs">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-center">
                                      {!record.is_absent && (
                                        <div className="relative inline-block text-left">
                                          <button
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dropdown-toggle p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={() => toggleDropdown(record.id!)}
                                          >
                                            <MoreVertical className="w-4 h-4" />
                                          </button>
                                          <Dropdown
                                            isOpen={openDropdownId === record.id}
                                            onClose={() => setOpenDropdownId(null)}
                                            className="w-40 right-0 left-auto top-full mt-1 z-[9999]"
                                          >
                                            <DropdownItem
                                              tag="button"
                                              onClick={() => { setDeleteModalRecord(record); setOpenDropdownId(null); }}
                                              className="flex items-center gap-2 text-error-500 hover:text-error-600 hover:bg-error-50"
                                            >
                                              <Trash2 className="w-4 h-4" /> Hapus
                                            </DropdownItem>
                                          </Dropdown>
                                        </div>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center justify-between dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Halaman <span className="font-medium text-gray-800 dark:text-white/90">{currentPage}</span> dari <span className="font-medium text-gray-800 dark:text-white/90">{totalPages}</span>
          </p>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      <Modal isOpen={!!deleteModalRecord} onClose={() => setDeleteModalRecord(null)} className="max-w-md m-4">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Konfirmasi Hapus</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Apakah Anda yakin ingin menghapus data presensi <span className="font-semibold text-gray-800 dark:text-white">{deleteModalRecord?.user_name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalRecord(null)}>Batal</Button>
            <Button variant="primary" className="bg-error-500 hover:bg-error-600 border-error-500" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
