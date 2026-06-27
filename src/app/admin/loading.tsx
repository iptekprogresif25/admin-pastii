export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Finance Overview Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
            <div className="mt-5">
              <div className="h-4 w-24 bg-gray-200 rounded dark:bg-gray-700 mb-3"></div>
              <div className="h-6 w-32 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Main Chart Skeleton */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
                <div className="mt-5">
                  <div className="h-4 w-24 bg-gray-200 rounded dark:bg-gray-700 mb-3"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 h-[400px]">
            <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded dark:bg-gray-700 mb-6"></div>
            <div className="h-64 w-full bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>

        {/* Side Donut Chart Skeleton */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 h-[400px]">
            <div className="h-6 w-40 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded dark:bg-gray-700 mb-6"></div>
            <div className="h-64 w-64 mx-auto rounded-full border-[20px] border-gray-200 dark:border-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
