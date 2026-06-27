"use client";

import { useState, useMemo } from "react";
import { Plus, Filter } from "lucide-react";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/modal";
import { FinanceOverview } from "@/components/dashboard/FinanceOverview";
import FinanceTable from "@/components/tables/FinanceTable";
import FinanceForm from "@/components/forms/FinanceForm";
import { FinanceTransaction } from "@/lib/finance/types";

interface FinanceClientProps {
  transactions: FinanceTransaction[];
  divisions: { id: number; name: string }[];
}

export default function FinanceClient({ transactions, divisions }: FinanceClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterDivision, setFilterDivision] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterDivision !== "all" && tx.division_id.toString() !== filterDivision) return false;
      if (filterType !== "all" && tx.type.toString() !== filterType) return false;
      return true;
    });
  }, [transactions, filterDivision, filterType]);

  // Hitung total untuk overview
  const totalMasuk = filteredTransactions.reduce((sum, tx) => (tx.type === 0 ? sum + tx.amount : sum), 0);
  const totalKeluar = filteredTransactions.reduce((sum, tx) => (tx.type === 1 ? sum + tx.amount : sum), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Keuangan Divisi</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola arus kas, pemasukan, dan pengeluaran divisi.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      <FinanceOverview totalMasuk={totalMasuk} totalKeluar={totalKeluar} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-48">
            <Select
              defaultValue={filterDivision}
              onChange={(value) => setFilterDivision(value)}
              options={[
                { value: "all", label: "Semua Divisi" },
                ...divisions.map((div) => ({ value: div.id.toString(), label: div.name }))
              ]}
              placeholder="Filter Divisi"
            />
          </div>

          <div className="w-48">
            <Select
              defaultValue={filterType}
              onChange={(value) => setFilterType(value)}
              options={[
                { value: "all", label: "Semua Tipe" },
                { value: "0", label: "Pemasukan" },
                { value: "1", label: "Pengeluaran" }
              ]}
              placeholder="Filter Tipe"
            />
          </div>
        </div>

        <FinanceTable transactions={filteredTransactions} divisions={divisions} />
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tambah Transaksi Kas</h3>
          <FinanceForm
            divisions={divisions}
            onSuccess={() => setIsAddModalOpen(false)}
            onClose={() => setIsAddModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
