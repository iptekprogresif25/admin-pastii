"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { FinanceTransaction } from "@/lib/finance/types";
import { deleteTransaction } from "@/app/admin/finance/actions";
import FinanceForm from "@/components/forms/FinanceForm";

import { toast } from "sonner";

interface FinanceTableProps {
  transactions: FinanceTransaction[];
  divisions: { id: number; name: string }[];
}

export default function FinanceTable({ transactions, divisions }: FinanceTableProps) {
  const [editingTx, setEditingTx] = useState<FinanceTransaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleEdit = (tx: FinanceTransaction) => {
    setEditingTx(tx);
    setIsEditModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setTxToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!txToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(txToDelete);
      setIsDeleteModalOpen(false);
      setTxToDelete(null);
      toast.success("Transaksi berhasil dihapus");
    } catch (error) {
      console.error("Failed to delete", error);
      toast.error("Gagal menghapus transaksi");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">
                Tanggal
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">
                Divisi
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">
                Keterangan
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">
                Tipe
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-xs uppercase dark:text-gray-400">
                Jumlah
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-xs uppercase dark:text-gray-400 w-16">
                Aksi
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Belum ada transaksi.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {tx.divisions?.name || `Divisi ${tx.division_id}`}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {tx.label}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm">
                    {tx.type === 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400">
                        Pemasukan
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-error-100 text-error-700 dark:bg-error-500/10 dark:text-error-400">
                        Pengeluaran
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-end font-semibold text-gray-900 dark:text-white">
                    <span className={tx.type === 0 ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"}>
                      {tx.type === 0 ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-center">
                    <div className="relative inline-block text-left">
                      <button 
                        onClick={() => toggleDropdown(tx.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dropdown-toggle"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <Dropdown
                        isOpen={openDropdownId === tx.id}
                        onClose={() => setOpenDropdownId(null)}
                        className="w-32 right-0 left-auto top-full mt-1 z-40"
                      >
                        <DropdownItem onClick={() => { handleEdit(tx); setOpenDropdownId(null); }}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownItem>
                        <DropdownItem onClick={() => { confirmDelete(tx.id); setOpenDropdownId(null); }} className="text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
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

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Transaksi</h3>
          {editingTx && (
            <FinanceForm
              divisions={divisions}
              initialData={editingTx}
              onSuccess={() => setIsEditModalOpen(false)}
              onClose={() => setIsEditModalOpen(false)}
            />
          )}
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => !isDeleting && setIsDeleteModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hapus Transaksi</h3>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
            <p>Apakah Anda yakin ingin menghapus transaksi ini? Data yang sudah dihapus tidak dapat dikembalikan.</p>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
