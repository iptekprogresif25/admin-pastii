'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton';
import { EventDetails } from '@/components/pdf/AttendanceReportPDF';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import Pagination from '@/components/tables/Pagination';
import { SearchIcon, MoreVertical, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { softDeleteEvent, toggleEventStatus } from '@/app/admin/events/actions';

interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string | null;
  type: string | null;
  location_id: string | null;
  is_active: boolean;
}

interface EventsTableProps {
  events: Event[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  initialSearch?: string;
}

export default function EventsTable({ 
  events, 
  totalCount, 
  currentPage, 
  itemsPerPage, 
  initialSearch = '' 
}: EventsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [deleteModalEvent, setDeleteModalEvent] = useState<Event | null>(null);
  const [toggleModalEvent, setToggleModalEvent] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const toggleDropdown = (id: number) => {
    if (openDropdownId === id) setOpenDropdownId(null);
    else setOpenDropdownId(id);
  };

  const handleDelete = async () => {
    if (!deleteModalEvent) return;
    setIsDeleting(true);
    const result = await softDeleteEvent(deleteModalEvent.id);
    setIsDeleting(false);
    if (result.success) {
      setDeleteModalEvent(null);
    } else {
      alert('Gagal menghapus kegiatan: ' + result.error);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleModalEvent) return;
    setIsToggling(true);
    const result = await toggleEventStatus(toggleModalEvent.id, toggleModalEvent.is_active);
    setIsToggling(false);
    if (result.success) {
      setToggleModalEvent(null);
    } else {
      alert('Gagal mengubah status kegiatan: ' + result.error);
    }
  };

  // Debounce search update
  useEffect(() => {
    // Hindari infinite loop jika search parameter di URL sudah sama dengan searchTerm
    const currentQ = searchParams.get('q') || '';
    if (currentQ === searchTerm) return;

    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set('q', searchTerm);
      } else {
        params.delete('q');
      }
      // Reset page to 1 when searching
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm, pathname, router, searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };
  
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Daftar Jadwal Kegiatan & Rapat
        </h3>
        <div className="w-full sm:max-w-sm relative">
          <Input 
            type="text" 
            placeholder="Cari nama kegiatan atau tipe..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>
      
      <div className="overflow-hidden border-t border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Nama Kegiatan
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Waktu
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Tipe
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                      {searchTerm ? "Tidak ada kegiatan yang sesuai dengan pencarian." : "Tidak ada data kegiatan."}
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => {
                    const eventDetails: EventDetails = {
                      title: event.title,
                      date: formatDate(event.start_time),
                      time: `${formatTime(event.start_time)} - ${event.end_time ? formatTime(event.end_time) : 'Selesai'}`,
                      location: event.location_id ? `Lokasi ID: ${event.location_id}` : 'Lokasi tidak ditentukan',
                    };

                    const isRapat = event.type?.toLowerCase() === 'rapat';

                    return (
                      <TableRow key={event.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {event.title}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {formatDate(event.start_time)}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {formatTime(event.start_time)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                          <Badge
                            size="sm"
                            color={isRapat ? "warning" : "success"}
                          >
                            {event.type || 'Kegiatan'}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                          <Badge
                            size="sm"
                            color={event.is_active ? 'success' : 'error'}
                          >
                            {event.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center text-theme-sm dark:text-gray-400 flex justify-center items-center gap-3">
                          <ExportPDFButton 
                            eventId={event.id}
                            eventDetails={eventDetails} 
                          />
                          
                          <div className="relative inline-block text-left">
                            <button
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dropdown-toggle"
                              onClick={() => toggleDropdown(event.id)}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            <Dropdown
                              isOpen={openDropdownId === event.id}
                              onClose={() => setOpenDropdownId(null)}
                              className="w-40 right-0 left-auto top-full mt-1 z-[9999]"
                            >
                              <DropdownItem
                                tag="a"
                                href={`/admin/events/${event.id}/edit`}
                                onItemClick={() => setOpenDropdownId(null)}
                                className="flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" /> Edit
                              </DropdownItem>
                              <DropdownItem
                                tag="button"
                                onClick={() => {
                                  setToggleModalEvent(event);
                                  setOpenDropdownId(null);
                                }}
                                className={`flex items-center gap-2 ${event.is_active ? 'text-warning-500 hover:text-warning-600 hover:bg-warning-50' : 'text-success-500 hover:text-success-600 hover:bg-success-50'}`}
                              >
                                {event.is_active ? (
                                  <>
                                    <PowerOff className="w-4 h-4" /> Nonaktifkan
                                  </>
                                ) : (
                                  <>
                                    <Power className="w-4 h-4" /> Aktifkan
                                  </>
                                )}
                              </DropdownItem>
                              <DropdownItem
                                tag="button"
                                onClick={() => {
                                  setDeleteModalEvent(event);
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
                    );
                  })
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
      <Modal isOpen={!!deleteModalEvent} onClose={() => setDeleteModalEvent(null)} className="max-w-md m-4">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Konfirmasi Hapus</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Apakah Anda yakin ingin menghapus kegiatan <span className="font-semibold text-gray-800 dark:text-white">{deleteModalEvent?.title}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalEvent(null)}>
              Batal
            </Button>
            <Button variant="primary" className="bg-error-500 hover:bg-error-600 border-error-500" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toggle Status Confirmation Modal */}
      <Modal isOpen={!!toggleModalEvent} onClose={() => setToggleModalEvent(null)} className="max-w-md m-4">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Konfirmasi Ubah Status</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Apakah Anda yakin ingin {toggleModalEvent?.is_active ? 'menonaktifkan' : 'mengaktifkan'} kegiatan <span className="font-semibold text-gray-800 dark:text-white">{toggleModalEvent?.title}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setToggleModalEvent(null)}>
              Batal
            </Button>
            <Button 
              variant="primary" 
              className={toggleModalEvent?.is_active ? 'bg-warning-500 hover:bg-warning-600 border-warning-500' : 'bg-success-500 hover:bg-success-600 border-success-500'} 
              onClick={handleToggleStatus} 
              disabled={isToggling}
            >
              {isToggling ? 'Memproses...' : toggleModalEvent?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
