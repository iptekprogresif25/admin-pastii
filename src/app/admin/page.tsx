import type { Metadata } from "next";
import React from "react";
import { createClient } from "@/utils/supabase/server";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { RecentEvents } from "@/components/dashboard/RecentEvents";
import { FinanceOverview } from "@/components/dashboard/FinanceOverview";
import { MemberDistributionChart } from "@/components/dashboard/MemberDistributionChart";
import { EventActivityChart } from "@/components/dashboard/EventActivityChart";

export const metadata: Metadata = {
  title: "Dashboard - Pastii",
  description: "Dashboard Admin HIMA-TI",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch counts efficiently in parallel
  const [
    { count: totalMembers },
    { count: totalDivisions },
    { count: totalEvents },
    { data: recentEvents },
    { data: kasData },
    { data: profilesData },
    { data: divisionsData },
    { data: allEvents },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).not("division_id", "is", null),
    supabase.from("divisions").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("id, title, type, start_time, is_active, is_open")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("division_kas").select("type, amount"),
    supabase.from("profiles").select("division_id").not("division_id", "is", null),
    supabase.from("divisions").select("id, name"),
    supabase.from("events").select("start_time"),
  ]);

  // --- Process Finance Data ---
  let totalMasuk = 0;
  let totalKeluar = 0;
  kasData?.forEach((kas) => {
    const amt = Number(kas.amount) || 0;
    if (kas.type === 0) totalMasuk += amt;
    else if (kas.type === 1) totalKeluar += amt;
  });

  // --- Process Member Distribution ---
  const divisionCounts: Record<number, number> = {};
  let withoutDivision = 0;
  profilesData?.forEach((profile) => {
    if (profile.division_id) {
      divisionCounts[profile.division_id] = (divisionCounts[profile.division_id] || 0) + 1;
    } else {
      withoutDivision++;
    }
  });

  const memberDistribution = divisionsData?.map((div) => ({
    name: div.name,
    count: divisionCounts[div.id] || 0,
  })) || [];

  if (withoutDivision > 0) {
    memberDistribution.push({ name: "Tanpa Divisi", count: withoutDivision });
  }

  // --- Process Event Activity ---
  const eventsByMonth = Array(12).fill(0);
  allEvents?.forEach((event) => {
    if (!event.start_time) return;
    const eventDate = new Date(event.start_time);
    if (!isNaN(eventDate.getTime())) {
      eventsByMonth[eventDate.getMonth()]++;
    }
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const eventActivityData = monthNames.map((month, index) => ({
    month,
    count: eventsByMonth[index],
  }));

  return (
    <div className="space-y-6">
      {/* Finance Widgets */}
      <FinanceOverview totalMasuk={totalMasuk} totalKeluar={totalKeluar} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Metrics Cards */}
          <DashboardMetrics
            totalMembers={totalMembers || 0}
            totalDivisions={totalDivisions || 0}
            totalEvents={totalEvents || 0}
          />
          
          {/* Event Activity Chart */}
          <EventActivityChart data={eventActivityData} />
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Member Distribution Donut Chart */}
          <MemberDistributionChart data={memberDistribution} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-12">
          {/* Recent Events Table */}
          <RecentEvents events={recentEvents || []} />
        </div>
      </div>
    </div>
  );
}
