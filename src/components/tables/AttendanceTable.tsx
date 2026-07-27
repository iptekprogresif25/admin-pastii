'use client';

import React from 'react';
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
import { Clock, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { toast } from 'sonner';
import { deleteAttendance } from '@/app/admin/attendance/actions';

interface AttendanceRecord {
  id: number;
  user_id: string;
  event_id: number;
  event_title: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string | null;
  notes: string | null;
  user_name: string;
  user_nim: string;
}

interface AttendanceTableProps {
  attendance: AttendanceRecord[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function AttendanceTable({ 
  attendance, 
  totalCount, 
  currentPage, 
  itemsPerPage, 
}: AttendanceTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [openDropdownId, setOpenDropdownId] = React.useState<number | null>(null);
  const [deleteModalRecord, setDeleteModalRecord] = React.useState<AttendanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

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
      toast.success(`Data presensi ${deleteModalRecord.user_name} berhasil dihapus`);
      setDeleteModalRecord(null);
    } else {
      toast.error('Gagal menghapus presensi: ' + result.error);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
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
      case 'PRESENT':
        return <Badge color="success">Hadir</Badge>;
      case 'LATE':
        return <Badge color="warning">Terlambat</Badge>;
      case 'EXCUSED':
        return <Badge color="info">Izin</Badge>;
      case 'ABSENT':
        return <Badge color="error">Alpa</Badge>;
      default:
        return <Badge color="light">{status || '-'}</Badge>;
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Riwayat Presensi
        </h3>
        {/* Could add filters by Event or Date here later */}
      </div>
      
      <div className="overflow-hidden border-t border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Pengurus
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Kegiatan
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Waktu Masuk
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Waktu Keluar
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 w-24"
                  >
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                      Tidak ada data presensi.
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {record.user_name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400 mt-0.5">
                          {record.user_nim}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm dark:text-gray-400 max-w-[200px] truncate">
                        {record.event_title}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">{formatTime(record.check_in_time)}</span>
                            <span className="text-xs text-gray-500">({formatDate(record.check_in_time)})</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                        {record.check_out_time ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">{formatTime(record.check_out_time)}</span>
                              <span className="text-xs text-gray-500">({formatDate(record.check_out_time)})</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Belum checkout</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-theme-sm dark:text-gray-400">
                        <div className="relative inline-block text-left">
                          <button
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dropdown-toggle"
                            onClick={() => toggleDropdown(record.id)}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          <Dropdown
                            isOpen={openDropdownId === record.id}
                            onClose={() => setOpenDropdownId(null)}
                            className="w-40 right-0 left-auto top-full mt-1 z-[9999]"
                          >
                            <DropdownItem
                              tag="a"
                              href={`/admin/attendance/${record.id}/edit`}
                              onItemClick={() => setOpenDropdownId(null)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </DropdownItem>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 flex items-center justify-between border-gray-200 dark:border-white/[0.05]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan <span className="font-medium text-gray-800 dark:text-white/90">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium text-gray-800 dark:text-white/90">{Math.min(currentPage * itemsPerPage, totalCount)}</span> dari <span className="font-medium text-gray-800 dark:text-white/90">{totalCount}</span> presensi
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
            Apakah Anda yakin ingin menghapus data presensi <span className="font-semibold text-gray-800 dark:text-white">{deleteModalRecord?.user_name}</span> untuk kegiatan <span className="font-semibold text-gray-800 dark:text-white">{deleteModalRecord?.event_title}</span>? Tindakan ini tidak dapat dibatalkan.
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
