'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Pagination from '@/components/tables/Pagination';
import { Clock, Trash2, MoreVertical, Calendar } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { deleteAttendance } from '@/app/admin/attendance/actions';

interface Attendee {
  id: number;
  user_id: string;
  user_name: string;
  user_nim: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string | null;
  notes: string | null;
}

interface DivisionGroup {
  division_id: number;
  division_name: string;
  attendees: Attendee[];
}

interface EventGroup {
  event_id: number;
  event_title: string;
  event_date: string;
  divisions: DivisionGroup[];
}

interface GroupedAttendanceViewProps {
  groupedData: EventGroup[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function GroupedAttendanceView({ 
  groupedData, 
  totalCount, 
  currentPage, 
  itemsPerPage, 
}: GroupedAttendanceViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [deleteModalRecord, setDeleteModalRecord] = useState<Attendee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);

  // Set default active tab to the first event when data changes
  useEffect(() => {
    if (groupedData.length > 0 && !groupedData.find(e => e.event_id === activeEventId)) {
      setActiveEventId(groupedData[0].event_id);
    }
  }, [groupedData, activeEventId]);

  const toggleDropdown = (id: number) => {
    if (openDropdownId === id) setOpenDropdownId(null);
    else setOpenDropdownId(id);
  };

  const handleDelete = async () => {
    if (!deleteModalRecord) return;
    setIsDeleting(true);
    const result = await deleteAttendance(deleteModalRecord.id);
    setIsDeleting(false);
    if (result.success) {
      setDeleteModalRecord(null);
    } else {
      alert('Gagal menghapus presensi: ' + result.error);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };
  
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit'
    });
  };

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

  return (
    <div className="space-y-6">
      {groupedData.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-500 dark:text-gray-400">Tidak ada data presensi.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar">
            <div className="flex w-max min-w-full px-2 pt-2">
              {groupedData.map((event) => (
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

          {/* Active Tab Content */}
          {activeEvent && (
            <div className="bg-white dark:bg-transparent animate-in fade-in duration-300">
              <div className="bg-gray-50/50 px-5 py-4 border-b border-gray-100 dark:bg-gray-800/20 dark:border-white/[0.02] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {formatDate(activeEvent.event_date)}
                </span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {activeEvent.divisions.length === 0 ? (
                  <div className="p-8 text-sm text-gray-500 text-center">Belum ada presensi untuk acara ini.</div>
                ) : (
                  activeEvent.divisions.map((division) => (
                    <div key={division.division_id} className="p-0">
                      <div className="bg-brand-50/30 px-5 py-2.5 border-b border-brand-100/50 dark:bg-brand-900/10 dark:border-brand-900/20">
                        <h4 className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                          {division.division_name}
                        </h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Pengurus</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Waktu Masuk</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Waktu Keluar</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Status</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-xs uppercase dark:text-gray-400 w-24">Aksi</TableCell>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {division.attendees.map((record) => (
                                <TableRow key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                  <TableCell className="px-5 py-3 text-start">
                                    <span className="block font-medium text-gray-800 text-sm dark:text-white/90">{record.user_name}</span>
                                    <span className="block text-gray-500 text-xs dark:text-gray-400">{record.user_nim}</span>
                                  </TableCell>
                                  <TableCell className="px-5 py-3 text-start text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                                      <span>{formatTime(record.check_in_time)}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-5 py-3 text-start text-sm text-gray-600 dark:text-gray-300">
                                    {record.check_out_time ? (
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{formatTime(record.check_out_time)}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 italic text-xs">Belum checkout</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="px-5 py-3 text-start">
                                    {getStatusBadge(record.status)}
                                  </TableCell>
                                  <TableCell className="px-5 py-3 text-center">
                                    <div className="relative inline-block text-left">
                                      <button
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dropdown-toggle"
                                        onClick={() => toggleDropdown(record.id)}
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
                                          onClick={() => {
                                            setDeleteModalRecord(record);
                                            setOpenDropdownId(null);
                                          }}
                                          className="flex items-center gap-2 text-error-500 hover:text-error-600 hover:bg-error-50"
                                        >
                                          <Trash2 className="w-4 h-4" /> Hapus
                                        </DropdownItem>
                                      </Dropdown>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center justify-between dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan <span className="font-medium text-gray-800 dark:text-white/90">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium text-gray-800 dark:text-white/90">{Math.min(currentPage * itemsPerPage, totalCount)}</span> dari <span className="font-medium text-gray-800 dark:text-white/90">{totalCount}</span> kegiatan
          </p>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteModalRecord} onClose={() => setDeleteModalRecord(null)} className="max-w-md m-4">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Konfirmasi Hapus</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Apakah Anda yakin ingin menghapus data presensi <span className="font-semibold text-gray-800 dark:text-white">{deleteModalRecord?.user_name}</span>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalRecord(null)}>
              Batal
            </Button>
            <Button variant="primary" className="bg-error-500 hover:bg-error-600 border-error-500" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
