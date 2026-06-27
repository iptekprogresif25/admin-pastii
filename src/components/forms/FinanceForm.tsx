"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { addTransaction, updateTransaction } from "@/app/admin/finance/actions";
import { FinanceTransaction } from "@/lib/finance/types";

interface FinanceFormProps {
  divisions: { id: number; name: string }[];
  initialData?: FinanceTransaction | null;
  onSuccess: () => void;
  onClose: () => void;
}

export default function FinanceForm({ divisions, initialData, onSuccess, onClose }: FinanceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      division_id: Number(formData.get("division_id")),
      label: formData.get("label") as string,
      amount: Number(formData.get("amount")),
      type: Number(formData.get("type")),
      date: formData.get("date") as string,
    };

    try {
      if (initialData?.id) {
        await updateTransaction(initialData.id, data);
      } else {
        await addTransaction(data);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const defaultDate = initialData?.date
    ? new Date(initialData.date).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16); // format for datetime-local

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-error-700 bg-error-50 rounded-lg dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div>
        <Label>Divisi</Label>
        <Select
          name="division_id"
          defaultValue={initialData?.division_id ? String(initialData.division_id) : ""}
          required
          options={divisions.map(div => ({ value: String(div.id), label: div.name }))}
          placeholder="Pilih Divisi"
        />
      </div>

      <div>
        <Label>Tipe Transaksi</Label>
        <Select
          name="type"
          defaultValue={initialData?.type !== undefined ? String(initialData.type) : "0"}
          required
          options={[
            { value: "0", label: "Pemasukan" },
            { value: "1", label: "Pengeluaran" }
          ]}
        />
      </div>

      <div>
        <Label>Jumlah (Rp)</Label>
        <Input
          name="amount"
          type="number"
          min="0"
          required
          defaultValue={initialData?.amount || ""}
          placeholder="Contoh: 100000"
        />
      </div>

      <div>
        <Label>Keterangan</Label>
        <Input
          name="label"
          type="text"
          required
          defaultValue={initialData?.label || ""}
          placeholder="Contoh: Pembelian alat tulis"
        />
      </div>

      <div>
        <Label>Tanggal & Waktu</Label>
        <Input
          name="date"
          type="datetime-local"
          required
          defaultValue={defaultDate}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
