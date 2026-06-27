'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Pagination from '@/components/tables/Pagination';
import dynamic from 'next/dynamic';
import { BoxCubeIcon, UserCircleIcon } from '@/icons';
import { ChevronDown, Trophy, Frown } from 'lucide-react';
import type { DivisionGroupData, MemberStat, AttendanceStats } from '@/lib/attendance/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

function MemberAvatar({ avatarUrl, name }: { avatarUrl?: string | null; name: string }) {
  if (avatarUrl) {
    return (
      <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const sibling = target.nextElementSibling as HTMLElement;
            if (sibling) sibling.style.display = 'flex';
          }}
        />
        <div className="w-full h-full items-center justify-center hidden">
          <UserCircleIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <UserCircleIcon className="w-5 h-5 text-gray-400" />
    </div>
  );
}

function MemberLeaderboard({ members, totalEvents }: { members: MemberStat[]; totalEvents: number }) {
  const [expanded, setExpanded] = useState(false);
  const preview = members.slice(0, 3);
  const rest = members.slice(3);

  const getRateColor = (rate: number) => {
    if (rate >= 75) return 'text-success-600 dark:text-success-400';
    if (rate >= 50) return 'text-warning-600 dark:text-warning-400';
    return 'text-error-600 dark:text-error-400';
  };

  const getRateBg = (rate: number) => {
    if (rate >= 75) return 'bg-success-500';
    if (rate >= 50) return 'bg-warning-500';
    return 'bg-error-500';
  };

  const renderRow = (member: MemberStat, index: number, overallIndex?: number) => {
    const rank = overallIndex !== undefined ? overallIndex + 1 : index + 1;
    const isTop1 = rank === 1;
    const isLast = rank === members.length;

    return (
      <div
        key={member.user_id}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
          isTop1 ? 'bg-yellow-50 dark:bg-yellow-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
        }`}
      >
        {/* Rank */}
        <span className={`text-xs font-bold w-5 text-center shrink-0 ${
          rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-gray-400'
        }`}>
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
        </span>

        {/* Avatar */}
        <MemberAvatar avatarUrl={member.avatar_url} name={member.user_name} />

        {/* Name */}
        <span className="text-xs font-medium text-gray-700 dark:text-gray-200 flex-1 truncate" title={member.user_name}>
          {member.user_name}
        </span>

        {/* Progress bar + rate */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-14 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full ${getRateBg(member.attendance_rate)}`}
              style={{ width: `${member.attendance_rate}%` }}
            />
          </div>
          <span className={`text-xs font-bold w-8 text-right ${getRateColor(member.attendance_rate)}`}>
            {member.attendance_rate}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-3">
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Trophy className="w-3.5 h-3.5 text-yellow-500" />
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Peringkat Anggota</span>
      </div>

      <div className="space-y-0.5">
        {preview.map((m, i) => renderRow(m, i))}
      </div>

      {rest.length > 0 && (
        <>
          {expanded && (
            <div className="space-y-0.5 mt-0.5">
              {rest.map((m, i) => renderRow(m, i, i + 3))}
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-brand-500 transition-colors py-1"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Sembunyikan' : `+${rest.length} anggota lainnya`}
          </button>
        </>
      )}

      {members.length === 0 && (
        <div className="flex items-center justify-center gap-1.5 py-4 text-xs text-gray-400">
          <Frown className="w-4 h-4" />
          <span>Tidak ada anggota</span>
        </div>
      )}
    </div>
  );
}

interface GroupedByDivisionViewProps {
  groupedData: DivisionGroupData[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function GroupedByDivisionView({ groupedData, totalCount, currentPage, itemsPerPage }: GroupedByDivisionViewProps) {
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
        <div className="flex flex-col items-center justify-center h-36 text-gray-400 dark:text-gray-500 text-sm">
          <p>Belum ada data presensi</p>
        </div>
      );
    }

    const series = [stats.present, stats.late, stats.excused, stats.absent];
    const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

    const options: ApexCharts.ApexOptions = {
      chart: { type: 'donut', fontFamily: 'inherit', background: 'transparent' },
      labels: ['Hadir', 'Terlambat', 'Izin', 'Alpa'],
      colors,
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: { show: false },
              value: { show: true, fontSize: '20px', fontWeight: 600, color: '#111827', formatter: (val) => val.toString() },
              total: {
                show: true,
                showAlways: true,
                label: 'Total Acara',
                fontSize: '9px',
                fontWeight: 500,
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
      tooltip: { enabled: true, theme: 'light', y: { formatter: (val) => val + ' orang' } },
    };

    return (
      <div className="relative flex justify-center items-center h-36">
        <ReactApexChart options={options} series={series} type="donut" height="100%" width="100%" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {groupedData.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-500 dark:text-gray-400">Tidak ada data divisi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {groupedData.map(div => {
            const hasData = div.stats.total > 0;
            const presenceRate = hasData
              ? Math.round(((div.stats.present + div.stats.late) / div.stats.total) * 100)
              : 0;

            return (
              <div key={div.division_id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 dark:border-gray-800 dark:bg-white/[0.03]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
                    {div.logo_url ? (
                      <>
                        <img
                          src={div.logo_url}
                          alt={div.division_name}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const sib = e.currentTarget.nextElementSibling as HTMLElement;
                            if (sib) sib.style.display = 'block';
                          }}
                        />
                        <BoxCubeIcon className="w-5 h-5 hidden" />
                      </>
                    ) : (
                      <BoxCubeIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-sm" title={div.division_name}>
                      {div.division_name}
                    </h3>
                    <p className={`text-xs font-medium ${presenceRate >= 75 ? 'text-success-500' : presenceRate >= 50 ? 'text-warning-500' : 'text-error-500'}`}>
                      {presenceRate}% hadir
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{div.members?.length || 0} org</span>
                </div>

                {/* Chart */}
                <div className="px-4 pt-4">
                  {renderChart(div.stats)}

                  {/* Stat pills */}
                  {hasData && (
                    <div className="mt-3 grid grid-cols-4 gap-1 text-center text-xs">
                      <div className="p-1.5 rounded-lg bg-success-50 dark:bg-success-500/10">
                        <div className="font-bold text-success-700 dark:text-success-400 text-sm leading-none">{div.stats.present}</div>
                        <div className="text-success-600/60 mt-0.5">Hadir</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-warning-50 dark:bg-warning-500/10">
                        <div className="font-bold text-warning-700 dark:text-warning-400 text-sm leading-none">{div.stats.late}</div>
                        <div className="text-warning-600/60 mt-0.5">Telat</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                        <div className="font-bold text-blue-700 dark:text-blue-400 text-sm leading-none">{div.stats.excused}</div>
                        <div className="text-blue-600/60 mt-0.5">Izin</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-error-50 dark:bg-error-500/10">
                        <div className="font-bold text-error-700 dark:text-error-400 text-sm leading-none">{div.stats.absent}</div>
                        <div className="text-error-600/60 mt-0.5">Alpa</div>
                      </div>
                    </div>
                  )}

                  {/* Member leaderboard */}
                  {div.members && div.members.length > 0 && (
                    <MemberLeaderboard members={div.members} totalEvents={div.stats.total} />
                  )}
                </div>

                <div className="h-4" />
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
