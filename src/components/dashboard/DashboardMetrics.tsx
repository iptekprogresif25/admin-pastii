import React from "react";
import { GroupIcon, GridIcon, CalenderIcon } from "@/icons";

interface DashboardMetricsProps {
  totalMembers: number;
  totalDivisions: number;
  totalEvents: number;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalMembers,
  totalDivisions,
  totalEvents,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* Metric: Members */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl dark:bg-brand-500/10">
          <GroupIcon className="text-brand-500 size-6 dark:text-brand-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Pengurus
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalMembers}
            </h4>
          </div>
        </div>
      </div>

      {/* Metric: Divisions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-info-50 rounded-xl dark:bg-info-500/10">
          <GridIcon className="text-info-500 size-6 dark:text-info-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Divisi
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalDivisions}
            </h4>
          </div>
        </div>
      </div>

      {/* Metric: Events */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-warning-50 rounded-xl dark:bg-warning-500/10">
          <CalenderIcon className="text-warning-500 size-6 dark:text-warning-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Kegiatan (Events)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalEvents}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};
