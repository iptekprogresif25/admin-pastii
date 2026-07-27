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
import Input from '@/components/form/input/InputField';
import Pagination from '@/components/tables/Pagination';
import { SearchIcon, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { toast } from 'sonner';
import { softDeleteProfile, toggleProfileStatus } from '@/app/admin/profiles/actions';
import { Power, PowerOff } from 'lucide-react';

export interface Profile {
  id: string;
  full_name: string | null;
  role: string | null;
  division_id: number | null;
  division?: { name: string } | { name: string }[] | null;
  is_active: boolean;
}

interface ProfilesTableProps {
  profiles: Profile[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  initialSearch?: string;
}

export default function ProfilesTable({ 
  profiles, 
  totalCount, 
  currentPage, 
  itemsPerPage, 
  initialSearch = '' 
}: ProfilesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteModalProfile, setDeleteModalProfile] = useState<Profile | null>(null);
  const [toggleModalProfile, setToggleModalProfile] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const toggleDropdown = (id: string) => {
    if (openDropdownId === id) setOpenDropdownId(null);
    else setOpenDropdownId(id);
  };

  const getDivisionName = (profile: Profile): string => {
    if (!profile.division) return 'Tidak ada divisi';
    if (Array.isArray(profile.division)) {
      return profile.division[0]?.name || 'Tidak ada divisi';
    }
    return profile.division.name || 'Tidak ada divisi';
  };

  const handleDelete = async () => {
    if (!deleteModalProfile) return;
    setIsDeleting(true);
    const result = await softDeleteProfile(deleteModalProfile.id);
    setIsDeleting(false);
    if (result.success) {
      toast.success(`Pengurus ${deleteModalProfile.full_name || ''} berhasil dihapus`);
      setDeleteModalProfile(null);
    } else {
      toast.error('Gagal menghapus pengurus: ' + result.error);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleModalProfile) return;
    setIsToggling(true);
    const result = await toggleProfileStatus(toggleModalProfile.id, toggleModalProfile.is_active);
    setIsToggling(false);
    if (result.success) {
      toast.success(`Status pengurus ${toggleModalProfile.full_name || ''} berhasil diperbarui`);
      setToggleModalProfile(null);
    } else {
      toast.error('Gagal mengubah status pengurus: ' + result.error);
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

  const getRoleBadgeColor = (role: string | null | undefined) => {
    const lowerRole = role?.toLowerCase() || '';
    if (lowerRole.includes('admin')) return 'error';
    if (lowerRole.includes('koordinator')) return 'warning';
    return 'success';
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Daftar Pengurus
        </h3>
        <div className="w-full sm:max-w-sm relative">
          <Input 
            type="text" 
            placeholder="Cari nama atau role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>
      
      <div className="overflow-hidden border-t border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Nama Lengkap
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Divisi
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Peran (Role)
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
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                      {searchTerm ? "Tidak ada pengurus yang sesuai dengan pencarian." : "Tidak ada data pengurus."}
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {profile.full_name || 'Tanpa Nama'}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                        {getDivisionName(profile)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={getRoleBadgeColor(profile.role)}
                        >
                          {profile.role || 'Member'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={profile.is_active ? 'success' : 'error'}
                        >
                          {profile.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-theme-sm dark:text-gray-400">
                        <div className="relative inline-block text-left">
                          <button
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dropdown-toggle"
                            onClick={() => toggleDropdown(profile.id)}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          <Dropdown
                            isOpen={openDropdownId === profile.id}
                            onClose={() => setOpenDropdownId(null)}
                            className="w-40 right-0 left-auto top-full mt-1"
                          >
                            <DropdownItem
                              tag="a"
                              href={`/admin/profiles/${profile.id}/edit`}
                              onItemClick={() => setOpenDropdownId(null)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </DropdownItem>
                            <DropdownItem
                              tag="button"
                              onClick={() => {
                                setToggleModalProfile(profile);
                                setOpenDropdownId(null);
                              }}
                              className={`flex items-center gap-2 ${profile.is_active ? 'text-warning-500 hover:text-warning-600 hover:bg-warning-50' : 'text-success-500 hover:text-success-600 hover:bg-success-50'}`}
                            >
                              {profile.is_active ? (
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
                                setDeleteModalProfile(profile);
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
            Menampilkan <span className="font-medium text-gray-800 dark:text-white/90">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium text-gray-800 dark:text-white/90">{Math.min(currentPage * itemsPerPage, totalCount)}</span> dari <span className="font-medium text-gray-800 dark:text-white/90">{totalCount}</span> pengurus
          </p>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <Modal isOpen={!!deleteModalProfile} onClose={() => setDeleteModalProfile(null)} className="max-w-md m-4">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Konfirmasi Hapus</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Apakah Anda yakin ingin menghapus pengurus <span className="font-semibold text-gray-800 dark:text-white">{deleteModalProfile?.full_name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalProfile(null)}>
              Batal
            </Button>
            <Button variant="primary" className="bg-error-500 hover:bg-error-600 border-error-500" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toggle Status Confirmation Modal */}
      <Modal isOpen={!!toggleModalProfile} onClose={() => setToggleModalProfile(null)} className="max-w-md m-4">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Konfirmasi Ubah Status</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Apakah Anda yakin ingin {toggleModalProfile?.is_active ? 'menonaktifkan' : 'mengaktifkan'} pengurus <span className="font-semibold text-gray-800 dark:text-white">{toggleModalProfile?.full_name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setToggleModalProfile(null)}>
              Batal
            </Button>
            <Button 
              variant="primary" 
              className={toggleModalProfile?.is_active ? 'bg-warning-500 hover:bg-warning-600 border-warning-500' : 'bg-success-500 hover:bg-success-600 border-success-500'} 
              onClick={handleToggleStatus} 
              disabled={isToggling}
            >
              {isToggling ? 'Memproses...' : toggleModalProfile?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
