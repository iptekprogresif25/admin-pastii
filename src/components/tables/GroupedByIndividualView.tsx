'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Pagination from '@/components/tables/Pagination';
import dynamic from 'next/dynamic';
import { UserCircleIcon } from '@/icons';
import { MessageSquare } from 'lucide-react';
import type { IndividualGroupData, AttendanceStats } from '@/lib/attendance/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface GroupedByIndividualViewProps {
  groupedData: IndividualGroupData[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function GroupedByIndividualView({ groupedData, totalCount, currentPage, itemsPerPage }: GroupedByIndividualViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const renderChart = (stats: AttendanceStats) => {
    if (stats.total === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500 text-sm">
          <p>Belum ada riwayat acara</p>
        </div>
      );
    }

    // Single event — show status badge instead of useless pie
    if (stats.total === 1) {
      let statusLabel = 'Alpa';
      let statusColor = 'text-error-600 dark:text-error-500';
      let bgColor = 'bg-error-50 dark:bg-error-500/10';
      let borderColor = 'border-error-300 dark:border-error-500/40';

      if (stats.present === 1) {
        statusLabel = 'Hadir';
        statusColor = 'text-success-600 dark:text-success-400';
        bgColor = 'bg-success-50 dark:bg-success-500/10';
        borderColor = 'border-success-300 dark:border-success-500/40';
      } else if (stats.late === 1) {
        statusLabel = 'Terlambat';
        statusColor = 'text-warning-600 dark:text-warning-400';
        bgColor = 'bg-warning-50 dark:bg-warning-500/10';
        borderColor = 'border-warning-300 dark:border-warning-500/40';
      } else if (stats.excused === 1) {
        statusLabel = 'Izin';
        statusColor = 'text-blue-600 dark:text-blue-400';
        bgColor = 'bg-blue-50 dark:bg-blue-500/10';
        borderColor = 'border-blue-300 dark:border-blue-500/40';
      }

      return (
        <div className="flex flex-col items-center justify-center h-40">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 ${bgColor} ${borderColor}`}>
            <span className={`text-lg font-bold ${statusColor}`}>{statusLabel}</span>
          </div>
        </div>
      );
    }

    const series = [stats.present, stats.late, stats.excused, stats.absent];
    const labels = ['Hadir', 'Terlambat', 'Izin', 'Alpa'];
    const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

    const options: ApexCharts.ApexOptions = {
      chart: { type: 'donut', fontFamily: 'inherit', background: 'transparent' },
      labels,
      colors,
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: { show: false },
              value: { show: true, fontSize: '22px', fontWeight: 600, color: '#111827', formatter: (val) => val.toString() },
              total: {
                show: true,
                showAlways: true,
                label: 'Total Acara',
                fontSize: '11px',
                color: '#6B7280',
                formatter: () => stats.total.toString(),
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      stroke: { show: false },
      tooltip: { enabled: true, theme: 'light', y: { formatter: (val) => val + ' kali' } },
    };

    return (
      <div className="relative flex justify-center items-center h-40">
        <ReactApexChart options={options} series={series} type="donut" height="100%" width="100%" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {groupedData.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-500 dark:text-gray-400">Tidak ada data pengurus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {groupedData.map(user => {
            const hasData = user.stats.total > 0;
            const attendedCount = user.stats.present + user.stats.late;
            const presenceRate = hasData ? Math.round((attendedCount / user.stats.total) * 100) : 0;
            const isMultiEvent = user.stats.total > 1;

            return (
              <div key={user.user_id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 dark:border-gray-800 dark:bg-white/[0.03]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {user.avatar_url ? (
                      <>
                        <img
                          src={user.avatar_url}
                          alt={user.user_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const sib = e.currentTarget.nextElementSibling as HTMLElement;
                            if (sib) sib.style.display = 'block';
                          }}
                        />
                        <UserCircleIcon className="w-7 h-7 text-gray-400" style={{ display: 'none' }} />
                      </>
                    ) : (
                      <UserCircleIcon className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm" title={user.user_name}>
                      {user.user_name}
                    </h3>
                    <p className="text-xs text-brand-500 font-medium truncate">{user.division_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user.user_nim}</p>
                  </div>

                  {/* Score badge */}
                  {isMultiEvent && (
                    <div className={`shrink-0 text-center px-2.5 py-1 rounded-lg text-sm font-bold ${
                      presenceRate >= 75 ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
                      : presenceRate >= 50 ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400'
                      : 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400'
                    }`}>
                      {presenceRate}%
                    </div>
                  )}
                </div>

                {/* Chart area */}
                <div className="p-4">
                  {renderChart(user.stats)}

                  {/* Stats pills */}
                  {hasData && isMultiEvent && (
                    <div className="mt-3 grid grid-cols-4 gap-1 text-center text-xs">
                      <div className="p-1.5 rounded-lg bg-success-50 dark:bg-success-500/10">
                        <div className="font-bold text-success-700 dark:text-success-400 text-base leading-none">{user.stats.present}</div>
                        <div className="text-success-600/70 dark:text-success-500/60 mt-0.5">Hadir</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-warning-50 dark:bg-warning-500/10">
                        <div className="font-bold text-warning-700 dark:text-warning-400 text-base leading-none">{user.stats.late}</div>
                        <div className="text-warning-600/70 dark:text-warning-500/60 mt-0.5">Telat</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                        <div className="font-bold text-blue-700 dark:text-blue-400 text-base leading-none">{user.stats.excused}</div>
                        <div className="text-blue-600/70 dark:text-blue-500/60 mt-0.5">Izin</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-error-50 dark:bg-error-500/10">
                        <div className="font-bold text-error-700 dark:text-error-400 text-base leading-none">{user.stats.absent}</div>
                        <div className="text-error-600/70 dark:text-error-500/60 mt-0.5">Alpa</div>
                      </div>
                    </div>
                  )}

                  {/* Permit notes section */}
                  {user.permit_notes && user.permit_notes.length > 0 && (
                    <div className="mt-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Alasan Izin</span>
                      </div>
                      <ul className="space-y-1">
                        {user.permit_notes.map((note: string, idx: number) => (
                          <li key={idx} className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                            {user.permit_notes.length > 1 ? `${idx + 1}. ` : ''}{note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
    </div>
  );
}
