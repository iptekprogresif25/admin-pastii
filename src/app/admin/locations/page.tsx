export default function LocationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manajemen Lokasi (Geofencing)</h2>
        <p className="text-muted-foreground">
          Tentukan titik lokasi kumpul dan radius presensi (geofencing).
        </p>
      </div>
      {/* Table Placeholder */}
      <div className="rounded-md border h-64 flex items-center justify-center bg-gray-50 text-gray-400">
        Tabel Lokasi akan ditampilkan di sini
      </div>
    </div>
  );
}
