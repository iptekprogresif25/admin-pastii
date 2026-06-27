"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DivisionData {
  name: string;
  count: number;
}

interface MemberDistributionChartProps {
  data: DivisionData[];
}

export const MemberDistributionChart: React.FC<MemberDistributionChartProps> = ({
  data,
}) => {
  const series = data.map((d) => d.count);
  const labels = data.map((d) => d.name || "Tanpa Divisi");

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
    },
    labels: labels,
    colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f43f5e"],
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "Total",
              fontSize: "16px",
              fontWeight: "600",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      fontFamily: "Outfit",
    },
    stroke: {
      show: false,
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Distribusi Pengurus
      </h3>
      <p className="mt-1 mb-6 text-gray-500 text-theme-sm dark:text-gray-400">
        Berdasarkan divisi aktif
      </p>

      <div className="flex items-center justify-center">
        <Chart options={options} series={series} type="donut" width="100%" height={320} />
      </div>
    </div>
  );
};
