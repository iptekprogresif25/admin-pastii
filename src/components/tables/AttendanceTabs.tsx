'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { GridIcon, BoxCubeIcon, UserCircleIcon } from '@/icons';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { ChevronDown } from 'lucide-react';

interface AttendanceTabsProps {
  currentView: string;
  eventsList?: { id: number; title: string }[];
  currentEventId?: string;
}

export default function AttendanceTabs({ currentView, eventsList, currentEventId }: AttendanceTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTabChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    params.delete('page'); // reset to page 1 on view change
    if (view === 'event') {
      params.delete('eventId'); // no need for event filter on event view
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleEventFilterChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'all') {
      params.delete('eventId');
    } else {
      params.set('eventId', val);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
    setIsDropdownOpen(false);
  };

  const tabs = [
    { id: 'event', label: 'Per Kegiatan', icon: <GridIcon className="w-4 h-4 mr-2" /> },
    { id: 'division', label: 'Per Divisi', icon: <BoxCubeIcon className="w-4 h-4 mr-2" /> },
    { id: 'individual', label: 'Per Individu', icon: <UserCircleIcon className="w-4 h-4 mr-2" /> },
  ];

  const currentEventTitle = currentEventId && currentEventId !== 'all' && eventsList
    ? eventsList.find(e => e.id.toString() === currentEventId)?.title || 'Semua Kegiatan'
    : 'Semua Kegiatan';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex bg-white dark:bg-white/[0.03] p-1 rounded-xl border border-gray-200 dark:border-gray-800 w-full sm:w-auto overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex-1 whitespace-nowrap ${
              currentView === tab.id
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {currentView !== 'event' && eventsList && (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="dropdown-toggle flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 h-[46px] w-full sm:w-auto min-w-[200px] text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="truncate flex-1 text-left mr-2">{currentEventTitle}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <Dropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            className="w-full min-w-[220px] top-full mt-1 z-50 max-h-60 overflow-y-auto"
          >
            <DropdownItem
              tag="button"
              onClick={() => handleEventFilterChange('all')}
              className={`w-full text-left px-4 py-2 ${(!currentEventId || currentEventId === 'all') ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium' : ''}`}
            >
              Semua Kegiatan
            </DropdownItem>
            {eventsList.map((evt) => (
              <DropdownItem
                tag="button"
                key={evt.id}
                onClick={() => handleEventFilterChange(evt.id.toString())}
                className={`w-full text-left px-4 py-2 truncate ${currentEventId === evt.id.toString() ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium' : ''}`}
              >
                {evt.title}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      )}
    </div>
  );
}
