import React from "react";
import { ArrowDownIcon, ArrowUpIcon, DollarLineIcon } from "@/icons";

interface FinanceOverviewProps {
  totalMasuk: number;
  totalKeluar: number;
}

export const FinanceOverview: React.FC<FinanceOverviewProps> = ({
  totalMasuk,
  totalKeluar,
}) => {
  const saldo = totalMasuk - totalKeluar;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* Saldo Akhir */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Saldo Akhir Kas
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              Rp {saldo.toLocaleString("id-ID")}
            </h4>
          </div>
        </div>
      </div>

      {/* Uang Masuk */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-success-50 rounded-xl dark:bg-success-500/10">
          <ArrowUpIcon className="text-success-500 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Uang Masuk
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              Rp {totalMasuk.toLocaleString("id-ID")}
            </h4>
          </div>
        </div>
      </div>

      {/* Uang Keluar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-error-50 rounded-xl dark:bg-error-500/10">
          <ArrowDownIcon className="text-error-500 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Uang Keluar
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              Rp {totalKeluar.toLocaleString("id-ID")}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};
